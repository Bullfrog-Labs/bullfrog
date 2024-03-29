import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Union

import cchardet
import requests
from dict_deep import deep_get
from newspaper import Article
from pocket import Pocket
from requests.exceptions import (ConnectionError, HTTPError, Timeout,
                                 TooManyRedirects)

from bookmarks_sync.firestore_database import (ArticleMetadataRecord,
                                               BookmarkRecord,
                                               FirestoreDatabase)

POCKET_ITEM_STATUS_DELETED = "2"


class BookmarkRecords(object):

  @classmethod
  def from_pocket_record(cls, pocket_record) -> BookmarkRecord:
    return {
        "pocket_item_id":
            pocket_record["item_id"],
        "url":
            pocket_record["resolved_url"],
        "pocket_created_at":
            datetime.fromtimestamp(int(pocket_record["time_added"])),
        "pocket_updated_at":
            datetime.fromtimestamp(int(pocket_record["time_updated"])),
        "pocket_json":
            json.dumps(pocket_record),
        "text":
            None,
        "metadata":
            None,
    }


class PocketBookmarks(object):

  def __init__(
      self,
      uid: str,
      pocket: Pocket,
      db: FirestoreDatabase,
      requests=requests,
      since: datetime = None,
  ):
    self.pocket = pocket
    self.logger = logging.getLogger("PocketBookmarks")
    self.db = db
    self.uid = uid
    self.since = since
    self.requests = requests

  def fetch_latest(self, max_pages=5) -> List[BookmarkRecord]:
    latest_bm = self.db.get_latest_bookmark(self.uid)
    start_time = self.since
    if latest_bm is not None and latest_bm["pocket_created_at"]:
      start_time = latest_bm["pocket_created_at"]

    start_timestamp = None
    if start_time:
      start_timestamp = int(datetime.timestamp(start_time))

    # Iterator
    pages = 0
    done = False
    offset = 0
    items = []

    # Page results
    while not done:
      self.logger.debug(
          f"fetch; since={start_timestamp}, count={10}, offset={offset}, oldest"
      )
      (response, _) = self.pocket.get(since=start_timestamp,
                                                  count=10,
                                                  offset=offset,
                                                  sort="oldest")
      if len(response) and (type(response["list"]) is dict) > 0:
        bookmarks = response["list"]
      else:
        bookmarks = {}

      self.logger.debug(f"results: {len(bookmarks)}")

      for (item_id, item) in bookmarks.items():
        self.logger.debug(f"got item with key {item_id}")
        if item["status"] != POCKET_ITEM_STATUS_DELETED:
          items.append(BookmarkRecords.from_pocket_record(item))

      offset += len(bookmarks)
      pages += 1
      if len(bookmarks) == 0 or pages >= max_pages:
        done = True

    return items

  def fetch_resources(self, items: List[BookmarkRecord]) -> Dict[str, str]:
    self.logger.debug("fetching {} urls".format(len(items)))
    pages = {}
    for _, item in enumerate(items):
      url = item["url"]
      pocket_item_id = item["pocket_item_id"]
      if url is None or url == "":
        self.logger.debug(
            f"skipping item where url is empty; pocket_item_id={pocket_item_id}"
        )
        continue
      try:
        self.logger.debug(f"fetch url {url}, id {pocket_item_id}")
        resp = self.requests.get(url)
        resp.raise_for_status()
        self.logger.debug("status=" + str(resp.status_code))
        if resp.encoding is None:
          resp.encoding = cchardet.detect(resp.content)['encoding']
          self.logger.debug("used encoding " + str(resp.encoding))
        if resp.encoding is None:
          self.logger.debug("encoding cannot be determined, skipping")
          continue
        pages[pocket_item_id] = resp.text
      except (HTTPError, Timeout, ConnectionError, TooManyRedirects) as _:
        # Record the error and move on
        self.logger.error("url fetch failed for {}".format(url))
    return pages

  def extract_from_tags(self, metadata) -> Dict[str, Any]:
    tags = {
        "authors": ["author"],
        "description": ["description"],
        "type": ["og.type"],
        "url": ["og.url"],
        "site": ["og.site_name"],
        "site_twitter": ["twitter.site"],
    }
    result = {}
    for key, locations in tags.items():
      for loc in locations:
        x = deep_get(metadata, loc)
        if x is not None:
          result[key] = x
          break

    if "authors" in result and type(result["authors"]) is not list:
      result["authors"] = [result["authors"]]

    return result

  def extract_metadata_from_article(self, article) -> ArticleMetadataRecord:
    extracted = self.extract_from_tags(article.meta_data)

    article_metadata: ArticleMetadataRecord = {
        "authors": extracted.get("authors", []),
        "description": extracted.get("description"),
        "article_type": extracted.get("type"),
        "url": extracted.get("url"),
        "site": extracted.get("site"),
        "site_twitter": extracted.get("site_twitter"),
        "publish_date": article.publish_date,
        "title": article.title,
        "text": article.text,
    }

    if article_metadata["authors"] is None:
      article_metadata["authors"] = article.authors

    if article_metadata["url"] is None:
      article_metadata["url"] = article.url

    return article_metadata

  def extract_metadata(
      self, items: List[BookmarkRecord]) -> Dict[str, ArticleMetadataRecord]:
    self.logger.debug("parsing {} articles".format(len(items)))
    metadata: Dict = {}
    for _, item in enumerate(items):
      text = item["text"]
      pocket_item_id = item["pocket_item_id"]
      url = item["url"]
      try:
        self.logger.debug(f"parse url {url} id {pocket_item_id}")
        article = Article(url, fetch_images=False)
        if text is None:
          self.logger.debug(f"skipping item where text is empty; url={url}")
          continue
        article.download(input_html=text)
        article.parse()
        self.logger.debug(f"done parsing")
        article_metadata = self.extract_metadata_from_article(article)

        if article_metadata['text'] is None:
          extracted_text_len = 0
        else:
          extracted_text_len = article_metadata['text']

        self.logger.debug(f"done; authors={article_metadata['authors']}, " +
                          f"title={article_metadata['title']}, " +
                          f"text={extracted_text_len}")
        metadata[pocket_item_id] = article_metadata
      except Exception as e:
        # Record the error and move on
        self.logger.error(f"extract failed for {url}; e={e}")
        raise e
    return metadata

  def save_records(self, records: List[BookmarkRecord]):
    self.db.add_items(self.uid, records)
    self.logger.debug(f"added {len(records)} items")

  # This algo is really dumb, it just fetches everything since last and then
  # saves them all. There may be some overlap but it doesn't try to address that.
  # Overlap will anyway just result in updating of the old value which generally
  # wont change it.
  def sync_latest(self) -> int:
    items = self.fetch_latest()

    # Fetch urls
    resources = self.fetch_resources(items)
    for item in items:
      pocket_item_id = item["pocket_item_id"]
      if pocket_item_id in resources:
        self.logger.debug(f"adding text for {pocket_item_id}")
        item["text"] = resources[pocket_item_id]

    # Extract metadata
    metadata = self.extract_metadata(items)
    for item in items:
      pocket_item_id = item["pocket_item_id"]
      if pocket_item_id in metadata:
        self.logger.debug(f"adding metadata for {pocket_item_id}")
        item["metadata"] = metadata[pocket_item_id]

    # None of the records will get saved if there's any error, which is a good
    # way to make sure we never lose track of any items.
    self.save_records(items)
    return len(items)
