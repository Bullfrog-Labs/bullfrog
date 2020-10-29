from pocket import Pocket
import logging
from datetime import datetime
from firestore_database import FirestoreDatabase, BookmarkRecord, ArticleMetadataRecord
from requests.exceptions import HTTPError, Timeout, ConnectionError, TooManyRedirects
import json
import uuid
import requests
from newspaper import Article
from typing import List, Dict, Any, Union, Optional
from dict_deep import deep_get


class BookmarkRecords(object):
  @classmethod
  def from_pocket_record(cls, pocket_record) -> BookmarkRecord:
    return {
        "uid": pocket_record["item_id"],
        "url": pocket_record["resolved_url"],
        "pocket_created_at": datetime.fromtimestamp(
            int(pocket_record["time_added"])
        ),
        "pocket_updated_at": datetime.fromtimestamp(
            int(pocket_record["time_updated"])
        ),
        "pocket_json": json.dumps(pocket_record),
        "text": None,
        "metadata": None,
        "created_at": None,
        "updated_at": None,
    }


class PocketBookmarks(object):
  def __init__(
      self,
      user_name: str,
      pocket: Pocket,
      db: FirestoreDatabase,
      requests=requests,
      since: datetime = None,
  ):
    self.pocket = pocket
    self.logger = logging.getLogger("PocketBookmarks")
    self.db = db
    self.user_name = user_name
    self.since = since
    self.requests = requests

  def fetch_latest(self) -> List[BookmarkRecord]:
    latest_bm = self.db.get_latest_bookmark(self.user_name)
    self.logger.debug(f"latest: {latest_bm}")
    start_time = self.since
    if latest_bm is not None and latest_bm["pocket_created_at"]:
      start_time = latest_bm["pocket_created_at"]

    start_timestamp = None
    if start_time:
      start_timestamp = int(datetime.timestamp(start_time))

    # Iterator
    done = False
    offset = 0
    items = []

    # Page results
    while not done:
      self.logger.debug(
          f"fetch; since={start_timestamp}, count={10}, offset={offset}, oldest"
      )
      (response, response_info) = self.pocket.get(
          since=start_timestamp, count=10, offset=offset, sort="oldest"
      )
      if len(response) and (type(response["list"]) is dict) > 0:
        bookmarks = response["list"]
      else:
        bookmarks = {}

      self.logger.debug(f"results: {bookmarks}")

      for (item_id, item) in bookmarks.items():
        self.logger.debug(f"got item with key {item_id}")
        items.append(BookmarkRecords.from_pocket_record(item))

      offset += len(bookmarks)
      if len(bookmarks) == 0:
        done = True

    return items

  def fetch_resources(self, items: List[BookmarkRecord]) -> Dict[str, str]:
    self.logger.debug("fetching {} urls".format(len(items)))
    pages = {}
    for i, item in enumerate(items):
      url = item["url"]
      uid = item["uid"]
      try:
        self.logger.debug(f"fetch url {url}, id {uid}")
        resp = self.requests.get(url)
        resp.raise_for_status()
        self.logger.debug("status=" + str(resp.status_code))
        pages[uid] = resp.text
      except (HTTPError, Timeout, ConnectionError, TooManyRedirects) as e:
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
        "twitter": ["twitter.site"],
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
        "twitter": extracted.get("twitter"),
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
      self, items: List[BookmarkRecord]
  ) -> Dict[str, ArticleMetadataRecord]:
    self.logger.debug("parsing {} articles".format(len(items)))
    metadata: Dict = {}
    for i, item in enumerate(items):
      text = item["text"]
      uid = item["uid"]
      url = item["url"]
      try:
        self.logger.debug(f"parse url {url} id {uid}")
        article = Article(url, fetch_images=False)
        article.download(input_html=text)
        article.parse()
        self.logger.debug(f"done parsing")
        article_metadata = self.extract_metadata_from_article(article)
        self.logger.debug(
            f"done; authors={article_metadata['authors']}, "
            + f"title={article_metadata['title']}, "
            + f"text={len(article_metadata['text'])}"
        )
        metadata[uid] = article_metadata
      except Exception as e:
        # Record the error and move on
        self.logger.error(f"extract failed for {url}; e={e}")
        raise e
    return metadata

  def save_records(self, records: List[BookmarkRecord]):
    self.db.add_items(self.user_name, records)
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
      uid = item["uid"]
      if uid in resources:
        self.logger.debug(f"adding text for {uid}")
        item["text"] = resources[uid]

    # Extract metadata
    metadata = self.extract_metadata(items)
    for item in items:
      uid = item["uid"]
      if uid in metadata:
        self.logger.debug(f"adding metadata for {uid}")
        item["metadata"] = metadata[uid]

    # None of the records will get saved if there's any error, which is a good
    # way to make sure we never lose track of any items.
    self.save_records(items)
    return len(items)
