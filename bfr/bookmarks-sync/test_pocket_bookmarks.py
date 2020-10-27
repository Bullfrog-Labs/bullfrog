import unittest
import json
import os
import logging
import time
import sys
from pocket_bookmarks import PocketBookmarks
from firestore_database import BookmarkRecord, FirestoreDatabase
from firebase_app import FirebaseApp
import requests

app = FirebaseApp.admin("bullfrog-reader-1")


def load_json(file_name):
    return json.loads(open(file_name).read())


single_bookmark = load_json("single_bookmark.json")


class SingleBMPocket(object):
    def get(self, **args):
        return (single_bookmark, {})


class EmptyPocket(object):
    def get(self, **args):
        return ({}, {})


logging.basicConfig(level="DEBUG")
logger = logging.getLogger("TestPocketBookmarks")


def clear_database():
    logger.debug("clearing db")
    r = requests.delete(
        "http://localhost:8080/emulator/v1/projects/bullfrog-reader-1/databases/(default)/documents"
    )
    logger.debug(f"done; status={r.status_code}")


user_name = "user@blfrg.xyz"


class TestPocketBookmarks(unittest.TestCase):
    def setUp(self):
        clear_database()

    def test_sync_latest_single_page(self):
        os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
        pocket = SingleBMPocket()
        db = FirestoreDatabase.emulator(app)
        bookmarks = PocketBookmarks(user_name, pocket, db)
        bookmarks.sync_latest()
        logger.info("done")
        latest = db.get_latest_bookmark(user_name)
        self.assertIsNotNone(latest)

    def test_sync_latest_no_results(self):
        os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
        pocket = EmptyPocket()
        db = FirestoreDatabase.emulator(app)
        bookmarks = PocketBookmarks(user_name, pocket, db)
        bookmarks.sync_latest()
        logger.info("done")
        latest = db.get_latest_bookmark(user_name)
        self.assertIsNone(latest)


if __name__ == "__main__":
    unittest.main()
