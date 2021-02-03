import * as log from "loglevel";
import { Database } from "./Database";
import { UserId } from "./Users";

const WHITELIST_COLLECTION = "whitelist";

export type IsUserWhiteListedFn = (uid: UserId) => Promise<boolean>;

export const buildIsUserWhitelisted = (
  database: Database
): IsUserWhiteListedFn => async (uid) => {
  const logger = log.getLogger("isUserWhitelisted");
  logger.debug(`Checking whitelist for ${uid}`);
  const whitelistDoc = await database
    .getHandle()
    .collection(WHITELIST_COLLECTION)
    .doc(uid)
    .get();
  return whitelistDoc.exists;
};
