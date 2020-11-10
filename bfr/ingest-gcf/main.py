#!/usr/bin/python3
from flask import escape
from bookmarks_sync.pocket_bookmarks import PocketBookmarks
from pocket import Pocket
import logging
from bookmarks_sync.firebase_app import FirebaseApp
from bookmarks_sync.firestore_database import FirestoreDatabase
from datetime import datetime
import os
import requests

# Obv. not secure, but its ok its just pocket. Will reset it later.
consumer_key = os.environ["CONSUMER_KEY"]
project_id = "bullfrog-reader"


def _sync_pocket_for_all_users():
  logger = logging.getLogger("main")
  app = FirebaseApp.admin(project_id)
  db = FirestoreDatabase.admin(app)

  users = db.get_users_private()
  for user in users:
    if user["pocket_sync_enabled"] and user["pocket_access_token"]:
      logger.debug(f"syncing {user['uid']}")
      pocket = Pocket(consumer_key, user["pocket_access_token"])
      bookmarks = PocketBookmarks(
          user["uid"], pocket, db, requests, since=datetime(2020, 9, 1)
      )
      logger.debug(f"initialized, syncing")
      count = bookmarks.sync_latest()
      logger.debug(f"done; count={count}")
    else:
      logger.debug(f"syncing disabled for {user['uid']}, skipping")


def sync_pocket_for_all_users(request):
  logger = logging.getLogger("main")
  logging.basicConfig(level="DEBUG")

  if request:
    request_json = request.get_json(silent=True)
    request_args = request.args
    logger.debug(f"got requests; json={request_json}, args={request_args}")

  _sync_pocket_for_all_users()

  return "Success"


if __name__ == "__main__":
  main(None)
