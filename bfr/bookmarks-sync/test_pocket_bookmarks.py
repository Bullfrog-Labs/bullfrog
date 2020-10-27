import unittest
import json
import os
import logging
import time
import sys
from pocket_bookmarks import PocketBookmarks
from firestore_database import BookmarkRecord, FirestoreDatabase
from firebase_app import FirebaseApp
from typing import List, Tuple
import requests

app = FirebaseApp.admin("bullfrog-reader")


def load_json(file_name):
    return json.loads(open(file_name).read())


single_bookmark = load_json("single_bookmark.json")
single_bookmark_contents = single_bookmark["item_0"]

single_record: List[Tuple] = [({"list": single_bookmark}, {})]
multiple_pages: List[Tuple] = [
    ({"list": single_bookmark}, {}),
    ({"list": single_bookmark}, {}),
]
multiple_records: List[Tuple] = [
    (
        {
            "list": {
                "item_0": single_bookmark_contents,
                "item_1": single_bookmark_contents,
            }
        },
        {},
    )
]
no_records: List[Tuple] = [({}, {})]


class IterMockPocket(object):
    def __init__(self, result_set):
        self.result_set = iter(result_set)

    def get(self, **args):
        try:
            return next(self.result_set)
        except StopIteration:
            return ({}, {})


logging.basicConfig(level="DEBUG")
logger = logging.getLogger("TestPocketBookmarks")


def clear_database():
    logger.debug("clearing db")
    r = requests.delete(
        "http://localhost:8080/emulator/v1/projects/bullfrog-reader/databases/(default)/documents"
    )
    logger.debug(f"done; status={r.status_code}")


user_name = "user@blfrg.xyz"


class TestPocketBookmarks(unittest.TestCase):
    def setUp(self):
        os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
        clear_database()

    def test_sync_latest_single_page(self):
        pocket = IterMockPocket(single_record)
        db = FirestoreDatabase.emulator(app)
        bookmarks = PocketBookmarks(user_name, pocket, db)
        count = bookmarks.sync_latest()
        latest = db.get_latest_bookmark(user_name)
        self.assertIsNotNone(latest)
        self.assertEqual(count, 1)

    def test_sync_latest_no_results(self):
        pocket = IterMockPocket(no_records)
        db = FirestoreDatabase.emulator(app)
        bookmarks = PocketBookmarks(user_name, pocket, db)
        count = bookmarks.sync_latest()
        latest = db.get_latest_bookmark(user_name)
        self.assertIsNone(latest)
        self.assertEqual(count, 0)

    def test_sync_latest_paging(self):
        pocket = IterMockPocket(multiple_pages)
        db = FirestoreDatabase.emulator(app)
        bookmarks = PocketBookmarks(user_name, pocket, db)
        count = bookmarks.sync_latest()
        latest = db.get_latest_bookmark(user_name)
        self.assertIsNotNone(latest)
        self.assertEqual(count, 2)


if __name__ == "__main__":
    unittest.main()
