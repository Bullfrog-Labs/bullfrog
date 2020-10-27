import unittest
import json
import os
import logging
import time
import sys
from firestore_database import FirestoreDatabase, BookmarkRecord
from firebase_app import FirebaseApp


def load_json(file_name):
    return json.loads(open(file_name).read())


single_bookmark = load_json("single_bookmark.json")

logging.basicConfig(level="DEBUG")
logger = logging.getLogger("TestFirestoreDatabase")

app = FirebaseApp.admin("bullfrog-reader-1")


class TestFirestoreDatabase(unittest.TestCase):
    def test_save_items(self):
        os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
        db = FirestoreDatabase.emulator(app)
        db.add_items(
            "user@blfrg.xyz",
            [
                {
                    "uid": "A84FB302-F7B6-4D88-BC36-5369812BBA90",
                    "url": "http://data.com",
                    "pocket_json": "{}",
                }
            ],
        )

    def test_get_latest(self):
        os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
        db = FirestoreDatabase.emulator(app)
        bm = db.get_latest_bookmark("user@blfrg.xyz")


if __name__ == "__main__":
    unittest.main()
