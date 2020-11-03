import logging
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from typing import TypedDict, List, Optional
from datetime import datetime


class ArticleMetadataRecord(TypedDict):
  authors: List[str]
  description: Optional[str]
  article_type: Optional[str]
  url: Optional[str]
  site: Optional[str]
  site_twitter: Optional[str]
  text: Optional[str]
  publish_date: Optional[datetime]
  title: Optional[str]


class BookmarkRecord(TypedDict):
  pocket_item_id: str
  url: str
  pocket_json: str
  pocket_created_at: datetime
  pocket_updated_at: datetime
  text: Optional[str]
  metadata: Optional[ArticleMetadataRecord]
  created_at: Optional[datetime]
  updated_at: Optional[datetime]


class UserRecord(TypedDict):
  uid: str
  created_at: Optional[datetime]
  updated_at: Optional[datetime]


class UserPrivateRecord(TypedDict):
  uid: str
  pocket_access_token: str
  pocket_sync_enabled: bool
  created_at: Optional[datetime]
  updated_at: Optional[datetime]


class FirestoreDatabase(object):
  def __init__(self, db):
    self.logger = logging.getLogger("FirestoreDatabase")
    self.db = db

  # Data access
  def get_latest_bookmark(self, uid: str) -> Optional[BookmarkRecord]:
    self.logger.debug("get latest")
    query_ref = (
        self.db.collection("users")
        .document(uid)
        .collection("bookmarks")
        .order_by("created_at", direction=firestore.Query.DESCENDING)
        .limit(1)
    )
    results = query_ref.get()
    if len(results) > 0:
      self.logger.debug(f"got {query_ref.get()[0].to_dict()}")
      return query_ref.get()[0].to_dict()
    else:
      return None

  def add_items(self, uid: str, bookmarks: List[BookmarkRecord]) -> None:
    self.logger.debug(f"saving bookmarks {len(bookmarks)}")
    for bookmark in bookmarks:
      self.apply_new_record_timestamps(bookmark)
      self.logger.debug(f"saving bookmark {bookmark}")
      result = (
          self.db.collection("users")
          .document(uid)
          .collection("bookmarks")
          .document(bookmark["pocket_item_id"])
          .set(bookmark)
      )
      self.logger.debug(f"done; result={result}")

  def update_user(self, uid: str, user_record: UserRecord, user_private_record: UserPrivateRecord):
    if self.db.collection("users").document(uid).get().exists:
      self.apply_updated_record_timestamps(user_record)
      self.db.collection("users").document(uid).update(user_record)
      self.db.collection("users").document(uid).collection(
        "users_private").document(uid).update(user_private_record)
    else:
      self.apply_new_record_timestamps(user_record)
      self.db.collection("users").document(uid).set(user_record)
      self.db.collection("users").document(uid).collection(
        "users_private").document(uid).set(user_private_record)

  def get_users(self) -> List[UserRecord]:
    return [doc.to_dict() for doc in self.db.collection("users").get()]

  def get_users_private(self) -> List[UserPrivateRecord]:
    return [doc.to_dict() for doc in self.db.collection_group("users_private").get()]

  # Helper functions
  def apply_new_record_timestamps(self, record):
    record["created_at"] = datetime.now()
    record["updated_at"] = record["created_at"]

  def apply_updated_record_timestamps(self, record):
    record["updated_at"] = datetime.now()

  # Named constructors
  @classmethod
  def admin(cls, app: firebase_admin.App):
    db = firestore.client(app)
    return FirestoreDatabase(db)
