from pocket import Pocket
import logging
from datetime import datetime
from firestore_database import FirestoreDatabase, BookmarkRecord
from requests.exceptions import HTTPError, Timeout, ConnectionError, TooManyRedirects
import json
import uuid
import requests
from typing import List, Dict


class BookmarkRecords(object):
    @classmethod
    def from_pocket_record(cls, pocket_record):
        return {
            "uid": pocket_record["item_id"],
            "url": pocket_record["given_url"],
            "pocket_created_at": datetime.fromtimestamp(
                int(pocket_record["time_added"])
            ),
            "pocket_updated_at": datetime.fromtimestamp(
                int(pocket_record["time_updated"])
            ),
            "pocket_json": json.dumps(pocket_record),
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

    def fetch_latest(self):
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

    def fetch_resources(self, items: List[BookmarkRecord]) -> Dict:
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

    def save_records(self, records: List[BookmarkRecord]):
        self.db.add_items(self.user_name, records)
        self.logger.debug(f"added {len(records)} items")

    # This algo is really dumb, it just fetches everything since last and then
    # saves them all. There may be some overlap but it doesn't try to address that.
    # Overlap will anyway just result in updating of the old value which generally
    # wont change it.
    def sync_latest(self) -> int:
        items = self.fetch_latest()

        # Fetch urls and meta
        resources = self.fetch_resources(items)
        for item in items:
            uid = item["uid"]
            if uid in resources:
                self.logger.debug(f"adding text for {uid}")
                item["text"] = resources[uid]

        # None of the records will get saved if there's any error, which is a good
        # way to make sure we never lose track of any items.
        self.save_records(items)
        return len(items)
