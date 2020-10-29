from pocket import Pocket
import logging
from datetime import datetime
from firestore_database import FirestoreDatabase
import json
import uuid


class BookmarkRecords(object):
  @classmethod
  def from_pocket_record(cls, pocket_record):
    return {
        "uid": pocket_record["item_id"],
        "url": pocket_record["given_url"],
        "pocket_created_at": datetime.fromtimestamp(
            int(pocket_record["time_added"])
        ),
        "pocket_updated_at": datetime.fromtimestamp(
            int(pocket_record["time_updated"])
        ),
        "pocket_json": json.dumps(pocket_record),
    }


class PocketBookmarks(object):
  def __init__(
      self,
      user_name: str,
      pocket: Pocket,
      db: FirestoreDatabase,
      since: datetime = None,
  ):
    self.pocket = pocket
    self.logger = logging.getLogger("PocketBookmarks")
    self.db = db
    self.user_name = user_name
    self.since = since

  # This algo is really dumb, it just fetches everything since last and then
  # saves them all. There may be some overlap but it doesn't try to address that.
  # Overlap will anyway just result in updating of the old value which generally
  # wont change it.
  def sync_latest(self) -> int:
    latest_bm = self.db.get_latest_bookmark(self.user_name)
    self.logger.debug(f"latest: {latest_bm}")
    start_time = self.since
    if latest_bm is not None and latest_bm["pocket_created_at"]:
      start_time = latest_bm["pocket_created_at"]

    start_timestamp = None
    if start_time:
      start_timestamp = int(datetime.timestamp(start_time))

    # Iterator
    done = False
    offset = 0
    items = []

    # Page results
    while not done:
      self.logger.debug(
          f"fetch; since={start_timestamp}, count={10}, offset={offset}, oldest"
      )
      (response, response_info) = self.pocket.get(
          since=start_timestamp, count=10, offset=offset, sort="oldest"
      )
      if len(response) and (type(response["list"]) is dict) > 0:
        bookmarks = response["list"]
      else:
        bookmarks = {}
      self.logger.debug(f"results: {bookmarks}")
      for (item_id, item) in bookmarks.items():
        self.logger.debug(f"got item with key {item_id}")
        items.append(BookmarkRecords.from_pocket_record(item))
      offset += len(bookmarks)
      if len(bookmarks) == 0:
        done = True

    # Collect
    self.db.add_items(self.user_name, items)
    self.logger.debug(f"added {len(items)} items")
    return len(items)
