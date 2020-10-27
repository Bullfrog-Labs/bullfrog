import unittest
from pocket_bookmarks import PocketBookmarks
import json
import os
import logging
import time
import sys


def load_json(file_name):
    return json.loads(open(file_name).read())


single_bookmark = load_json('single_bookmark.json')


class MockPocket(object):
    def get(self, **args):
        return (single_bookmark, {})


logging.basicConfig(stream=sys.stderr, level="DEBUG")
logger = logging.getLogger("TestPocketBookmarks")


class TestPocketBookmarks(unittest.TestCase):

    def test_sync_latest_single_page(self):
        api = MockPocket()
        bookmarks = PocketBookmarks(api)
        bookmarks.sync_latest()
        logger.info("here")
        self.assertEqual('foo'.upper(), 'FOO1')


if __name__ == "__main__":
    os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
    unittest.main()
