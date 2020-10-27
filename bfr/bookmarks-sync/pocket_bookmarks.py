from pocket import Pocket
import logging
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from typing import TypedDict, List
from datetime import datetime
from firestore_database import FirestoreDatabase


class PocketBookmarks(object):
    def __init__(self, pocket_api: Pocket):
        self.pocket_api = pocket_api
        self.logger = logging.getLogger("PocketBookmarks")
        self.db = FirestoreDatabase.emulator("bullfrog-reader-1")

    def sync_latest(self):
        page = self.pocket_api.get(count=1)
