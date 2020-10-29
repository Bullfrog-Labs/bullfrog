import unittest
import requests
import logging
import fetch_resource


class IterMockRequests(object):
    def __init__(self, result_set):
        self.result_set = iter(result_set)

    def get(self, **args):
        try:
            return next(self.result_set)
        except StopIteration:
            return ({}, {})


logging.basicConfig(level="DEBUG")
logger = logging.getLogger("TestFetchResource")

user_name = "user@blfrg.xyz"

fixture_page_1 = open("./fixture_page_1.html").read()


class MockResponse(object):
    status_code: int = 200
    text: str = fixture_page_1

    def raise_for_status(self):
        return


single_request = [MockResponse()]


class TestFetchResource(unittest.TestCase):
    def test_fetch_one_url(self):
        IterMockRequests(single_request)
        fetch = fetch_resource.create(requests)
        r = fetch(["https://publicobject.com/2008/06/strict-vs-forgiving-apis.html"])
        logger.debug(f"got {r}")


if __name__ == "__main__":
    unittest.main()
