#!/usr/bin/python3
from flask import escape
from pocket_bookmarks import PocketBookmarks
from pocket import Pocket
import logging
from firebase_app import FirebaseApp
from firestore_database import FirestoreDatabase
from datetime import datetime
import os
import requests

# Obv. not secure, but its ok its just pocket. Will reset it later.
consumer_key = os.environ["CONSUMER_KEY"]
access_token = os.environ["ACCESS_TOKEN"]
project_id = "bullfrog-reader"
user_name = "agrodellic@gmail.com"


def main(request):
  logger = logging.getLogger("main")
  logging.basicConfig(level="DEBUG")

  if request:
    request_json = request.get_json(silent=True)
    request_args = request.args
    logger.debug(f"got requests; json={request_json}, args={request_args}")

    app = FirebaseApp.admin(project_id)
    db = FirestoreDatabase.emulator(app)
    pocket = Pocket(consumer_key, access_token)
    bookmarks = PocketBookmarks(
        user_name, pocket, db, requests, since=datetime(2020, 9, 1)
    )

  logger.debug(f"initialized, syncing")
  count = bookmarks.sync_latest()

  logger.debug(f"done; count={count}")

  return "Success"


if __name__ == "__main__":
  main(None)
