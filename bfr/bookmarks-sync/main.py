#!/usr/bin/python3
from flask import escape
from pocket_bookmarks import PocketBookmarks
from pocket import Pocket
import logging
from firebase_app import FirebaseApp
from firestore_database import FirestoreDatabase
from datetime import datetime

consumer_key = "93907-4bc0f7edcc3af162423e8b53"
access_token = "a0af4686-b342-6348-386c-719575"
project_id = "bullfrog-reader"
user_name = "agrodellic@gmail.com"


def main(request):
    logger = logging.getLogger("main")
    logging.basicConfig(level="DEBUG")

    if request:
        request_json = request.get_json(silent=True)
        request_args = request.args
        logger.debug(f"got requests; json={request_json}")

    app = FirebaseApp.admin(project_id)
    db = FirestoreDatabase.emulator(app)
    pocket = Pocket(consumer_key, access_token)
    bookmarks = PocketBookmarks(user_name, pocket, db, since=datetime(2020, 9, 1))

    logger.debug(f"initialized, syncing")
    count = bookmarks.sync_latest()

    logger.debug(f"done; count={count}")

    return None


if __name__ == "__main__":
    main(None)
