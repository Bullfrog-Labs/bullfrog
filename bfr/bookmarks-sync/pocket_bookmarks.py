from pocket import Pocket
import logging
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore


class FirestoreDatabase(object):
    def __init__(self, db):
        self.logger = logging.getLogger("FirestoreDatabase")
        self.db = db

    def get_latest_bookmark(self):
        self.logger.debug("get latest")

    @classmethod
    def admin(cls, project_id):
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred, {
            'projectId': project_id,
        })
        db = firestore.client()
        return FirestoreDatabase(db)

    @classmethod
    def emulator(cls, project_id):
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred, {
            'projectId': project_id,
        })
        db = firestore.client()
        return FirestoreDatabase(db)


class PocketBookmarks(object):
    def __init__(self, pocket_api: Pocket):
        self.pocket_api = pocket_api
        self.logger = logging.getLogger("PocketBookmarks")
        self.db = FirestoreDatabase.emulator("bullfrog-reader-1")

    def sync_latest(self):
        page = self.pocket_api.get(count=1)
