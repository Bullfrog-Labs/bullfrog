import logging
import argparse
from bookmarks_sync.firestore_database import FirestoreDatabase, UserRecord, UserPrivateRecord
from bookmarks_sync.firebase_app import FirebaseApp


project_id = "bullfrog-reader"


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument("--log-level", type=str, default="INFO")
  parser.add_argument(
    "--uid",
    type=str,
    required=True,
    help="User id to update",
  )
  parser.add_argument(
    "--pocket-access-token",
    type=str,
    required=False,
    help="Pocket access token to use",
  )
  parser.add_argument(
    "--pocket-sync-enabled",
    action='store_true',
    dest='pocket_sync_enabled',
    default=None
  )
  parser.add_argument(
    "--pocket-sync-disabled",
    action='store_false',
    dest='pocket_sync_enabled',
    default=None
  )
  args = parser.parse_args()
  logging.basicConfig(level=args.log_level)
  logger = logging.getLogger("update_user")
  logger.debug("starting...")

  app = FirebaseApp.admin(project_id)
  db = FirestoreDatabase.admin(app)

  user_record: UserRecord = {"uid": args.uid}
  user_private_record: UserPrivateRecord = {"uid": args.uid}
  if args.pocket_sync_enabled is not None:
    user_private_record["pocket_sync_enabled"] = args.pocket_sync_enabled
  if args.pocket_access_token:
    user_private_record["pocket_access_token"] = args.pocket_access_token

  logger.debug(
    f"setting record; user={user_record} , user_private={user_private_record}")

  db.update_user(args.uid, user_record, user_private_record)


main()
