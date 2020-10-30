import logging
import argparse
from bookmarks_sync.firestore_database import FirestoreDatabase
from bookmarks_sync.firebase_app import FirebaseApp


project_id = "bullfrog-reader"


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument("--log-level", type=str, default="INFO")
  parser.add_argument(
    "--user-name",
    type=str,
    required=True,
    help="User name to update",
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
  )
  parser.add_argument(
    "--pocket-sync-disabled",
    action='store_false',
    dest='pocket_sync_enabled',
  )
  args = parser.parse_args()
  logging.basicConfig(level=args.log_level)
  logger = logging.getLogger("update_user")
  logger.debug("starting...")

  app = FirebaseApp.admin(project_id)
  db = FirestoreDatabase.admin(app)

  user_record = {"user_name": args.user_name}
  if args.pocket_sync_enabled is not None:
    user_record["pocket_sync_enabled"] = args.pocket_sync_enabled
  if args.pocket_access_token:
    user_record["pocket_access_token"] = args.pocket_access_token

  logger.debug(f"setting record {user_record}")

  db.update_user(args.user_name, user_record)


main()
