import logging
import argparse
from bookmarks_sync.firestore_database import FirestoreDatabase


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
    "--access-token",
    type=str,
    required=True,
    help="Pocket access token to use",
  )
  args = parser.parse_args()
  logging.basicConfig(level=args.log_level)
  logger = logging.getLogger("update_user")
  logger.debug("Starting...")


main()
