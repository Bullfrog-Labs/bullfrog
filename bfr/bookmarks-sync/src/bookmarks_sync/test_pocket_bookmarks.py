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


class IterMockRequests(object):
  def __init__(self, result_set):
    self.result_set = iter(result_set)

  def get(self, url):
    try:
      return next(self.result_set)
    except StopIteration:
      return ({}, {})


fixture_page_1 = open("./fixture_page_1.html").read()


class MockResponse(object):
  status_code: int = 200
  text: str = fixture_page_1

  def raise_for_status(self):
    return


logging.basicConfig(level="DEBUG")
logger = logging.getLogger("TestPocketBookmarks")


def clear_database():
  logger.debug("clearing db")
  r = requests.delete(
      "http://localhost:8080/emulator/v1/projects/bullfrog-reader/databases/(default)/documents"
  )
  logger.debug(f"done; status={r.status_code}")


uid = "1234567890"


class TestPocketBookmarks(unittest.TestCase):
  def setUp(self):
    os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
    clear_database()

  def test_sync_latest_single_page(self):
    pocket = IterMockPocket(single_record)
    db = FirestoreDatabase.admin(app)
    mock_requests = IterMockRequests([MockResponse()])
    bookmarks = PocketBookmarks(uid, pocket, db, mock_requests)
    count = bookmarks.sync_latest()
    latest = db.get_latest_bookmark(uid)
    self.assertIsNotNone(latest)
    self.assertEqual(count, 1)

  def test_sync_latest_no_results(self):
    pocket = IterMockPocket(no_records)
    db = FirestoreDatabase.admin(app)
    mock_requests = IterMockRequests([])
    bookmarks = PocketBookmarks(uid, pocket, db, mock_requests)
    count = bookmarks.sync_latest()
    latest = db.get_latest_bookmark(uid)
    self.assertIsNone(latest)
    self.assertEqual(count, 0)

  def test_sync_latest_paging(self):
    pocket = IterMockPocket(multiple_pages)
    db = FirestoreDatabase.admin(app)
    mock_requests = IterMockRequests([MockResponse(), MockResponse()])
    bookmarks = PocketBookmarks(uid, pocket, db, mock_requests)
    count = bookmarks.sync_latest()
    latest = db.get_latest_bookmark(uid)
    self.assertIsNotNone(latest)
    self.assertEqual(count, 2)


if __name__ == "__main__":
  unittest.main()
