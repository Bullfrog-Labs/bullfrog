from pocket import Pocket
import logging
from datetime import datetime
from firestore_database import FirestoreDatabase
import json


class BookmarkRecords(object):
    @classmethod
    def from_pocket_record(cls, pocket_record):
        return {
            "uid": "A84FB302-F7B6-4D88-BC36-5369812BBA90",
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
    def __init__(self, user_name: str, pocket: Pocket, db: FirestoreDatabase):
        self.pocket = pocket
        self.logger = logging.getLogger("PocketBookmarks")
        self.db = db
        self.user_name = user_name

    def sync_latest(self):
        # page = self.pocket_api.get(count=1)
        latest_bm = self.db.get_latest_bookmark(self.user_name)
        self.logger.debug(f"latest: {latest_bm}")
        start_time = None
        if latest_bm is not None and latest_bm["pocket_created_at"]:
            start_time = latest_bm["pocket_created_at"]
        results = self.pocket.get(since=start_time)
        self.logger.debug(f"results: {results}")
        items = []
        for (item_id, item) in results[0].items():
            self.logger.debug(f"got item with key {item_id}")
            items.append(BookmarkRecords.from_pocket_record(item))
        self.db.add_items(self.user_name, items)
        self.logger.debug(f"added {len(items)} items")
