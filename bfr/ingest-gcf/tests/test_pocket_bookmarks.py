import json
import logging
import os
import unittest
from unittest.mock import Mock
from typing import Any, List, Tuple

import pocket

import requests

from bookmarks_sync.firebase_app import FirebaseApp
from bookmarks_sync.firestore_database import FirestoreDatabase
from bookmarks_sync.pocket_bookmarks import PocketBookmarks

app = FirebaseApp.admin("bullfrog-reader")


def load_json(file_name):
  return json.loads(open(file_name).read())


single_bookmark = load_json("tests/resources/single_bookmark.json")
single_bookmark_contents = single_bookmark["item_0"]

single_record: List[Tuple] = [({"list": single_bookmark}, {})]
multiple_pages: List[Tuple] = [
    ({
        "list": single_bookmark
    }, {}),
    ({
        "list": single_bookmark
    }, {}),
]
multiple_records: List[Tuple] = [(
    {
        "list": {
            "item_0": single_bookmark_contents,
            "item_1": single_bookmark_contents,
        }
    },
    {},
)]
no_records: List[Tuple] = [({}, {})]


def make_mock_pocket(result_set):
  result_set_iter = iter(result_set)

  def mock_get(**args):
    try: 
      return next(result_set_iter)
    except StopIteration:
      return ({}, {})
      
  mock_pocket = Mock(spec=pocket.Pocket)
  mock_pocket.get = mock_get

  return mock_pocket


class IterMockRequests(object):

  def __init__(self, result_set):
    self.result_set = iter(result_set)

  def get(self, url):
    try:
      return next(self.result_set)
    except StopIteration:
      return ({}, {})


fixture_page_1 = open("tests/resources/fixture_page_1.html").read()


class MockResponse(object):
  status_code: int = 200
  text: str = fixture_page_1
  encoding: Any = None
  content: Any = bytes(fixture_page_1, 'utf-8')

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
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "tests/resources/test-project-4abbf-199fc0e689ec.json"
    clear_database()

  def test_sync_latest_single_page(self):
    mock_pocket = make_mock_pocket(single_record)
    db = FirestoreDatabase.admin(app)
    mock_requests = IterMockRequests([MockResponse()])
    bookmarks = PocketBookmarks(uid, mock_pocket, db, mock_requests)
    count = bookmarks.sync_latest()
    latest = db.get_latest_bookmark(uid)
    self.assertIsNotNone(latest)
    self.assertEqual(count, 1)

  def test_sync_latest_no_results(self):
    mock_pocket = make_mock_pocket(no_records)
    db = FirestoreDatabase.admin(app)
    mock_requests = IterMockRequests([])
    bookmarks = PocketBookmarks(uid, mock_pocket, db, mock_requests)
    count = bookmarks.sync_latest()
    latest = db.get_latest_bookmark(uid)
    self.assertIsNone(latest)
    self.assertEqual(count, 0)

  def test_sync_latest_paging(self):
    mock_pocket = make_mock_pocket(multiple_pages)
    db = FirestoreDatabase.admin(app)
    mock_requests = IterMockRequests([MockResponse(), MockResponse()])
    bookmarks = PocketBookmarks(uid, mock_pocket, db, mock_requests)
    count = bookmarks.sync_latest()
    latest = db.get_latest_bookmark(uid)
    self.assertIsNotNone(latest)
    self.assertEqual(count, 2)


if __name__ == "__main__":
  unittest.main()
