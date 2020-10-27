import logging
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from typing import TypedDict, List
from datetime import datetime


class DocumentResourceRecord(TypedDict):
    uid: str
    url: str
    pocket_json: str


class BookmarkRecord(TypedDict):
    uid: str
    url: str
    created_at: datetime
    pocket_json: str


class FirestoreDatabase(object):
    def __init__(self, db):
        self.logger = logging.getLogger("FirestoreDatabase")
        self.db = db
   
   # Data access
    def get_latest_bookmark(self, user_name: str):
        self.logger.debug("get latest")
        query_ref = (
            self.db.collection("users")
            .document(user_name)
            .collection("bookmarks")
            .order_by("created_at", direction=firestore.Query.DESCENDING)
            .limit(1)
        )
        self.logger.debug(f"got {query_ref}")
        return query_ref

    def add_items(self, user_name: str, bookmarks: List[BookmarkRecord]):
        self.logger.debug(f"saving bookmarks {len(bookmarks)}")
        for bookmark in bookmarks:
            self.apply_new_record_timestamps(bookmark)
            self.logger.debug(f"saving bookmark {bookmark}")
            result = (
                self.db.collection("users")
                .document(user_name)
                .collection("bookmarks")
                .document(bookmark["uid"])
                .set(bookmark)
            )
            self.logger.debug(f"done; result={result}")

    # Helper functions
    def apply_new_record_timestamps(self, record):
        record["created_at"] = datetime.now()
        record["updated_at"] = record["created_at"]

    # Named constructors
    @classmethod
    def emulator(cls, app: firebase_admin.App):
        db = firestore.client(app)
        return FirestoreDatabase(db)
