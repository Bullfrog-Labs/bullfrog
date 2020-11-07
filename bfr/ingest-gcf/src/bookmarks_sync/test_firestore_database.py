import unittest
import json
import os
import logging
import time
import sys
from firestore_database import FirestoreDatabase, BookmarkRecord
from firebase_app import FirebaseApp
import datetime
import uuid
import requests


def load_json(file_name):
  return json.loads(open(file_name).read())


single_bookmark = load_json("single_bookmark.json")

logging.basicConfig(level="DEBUG")
logger = logging.getLogger("TestFirestoreDatabase")

app = FirebaseApp.admin("bullfrog-reader")


def clear_database():
  logger.debug("clearing db")
  r = requests.delete(
      "http://localhost:8080/emulator/v1/projects/bullfrog-reader/databases/(default)/documents"
  )
  logger.debug(f"done; status={r.status_code}")


class BookmarkRecords(object):
  @classmethod
  def from_pocket_record(cls, pocket_record):
    return {
        "pocket_item_id": "A84FB302-F7B6-4D88-BC36-5369812BBA90",
        "url": pocket_record["given_url"],
        "pocket_created_at": datetime.datetime.fromtimestamp(
            int(pocket_record["time_added"])
        ),
        "pocket_updated_at": datetime.datetime.fromtimestamp(
            int(pocket_record["time_updated"])
        ),
        "pocket_json": json.dumps(pocket_record),
    }


class TestFirestoreDatabase(unittest.TestCase):
  def setUp(self):
    os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
    clear_database()

  def test_save_items(self):
    db = FirestoreDatabase.admin(app)
    db.add_items(
        "user@blfrg.xyz",
        [BookmarkRecords.from_pocket_record(single_bookmark["item_0"])],
    )

  def test_get_latest(self):
    db = FirestoreDatabase.admin(app)
    bm0 = db.get_latest_bookmark("user@blfrg.xyz")
    self.assertEqual(bm0, None)
    bm1 = BookmarkRecords.from_pocket_record(single_bookmark["item_0"])
    bm2 = BookmarkRecords.from_pocket_record(single_bookmark["item_0"])
    bm2["url"] = "http://last.com"
    db.add_items(
        "user@blfrg.xyz",
        [bm1],
    )
    db.add_items(
        "user@blfrg.xyz",
        [bm2],
    )
    bm = db.get_latest_bookmark("user@blfrg.xyz")
    self.assertEqual(bm["url"], "http://last.com")


if __name__ == "__main__":
  unittest.main()
