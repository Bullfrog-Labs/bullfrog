import { User } from "firebase";
import * as log from "loglevel";
import { Database } from "./Database";

const logger = log.getLogger("store/Users");

// possible for users to only have phone numbers (e.g. phone auth)
type Email = string;
type UserId = Email;

export interface UserRecord {
  uid: UserId;
}

const USERS_COLLECTION = "users";

export const getUser = async (
  database: Database,
  userId: UserId
): Promise<UserRecord | null> => {
  logger.debug(`Fetching user ${userId}`);
  const userDoc = await database
    .getHandle()
    .collection(USERS_COLLECTION)
    .doc(userId)
    .get();

  return userDoc.exists
    ? {
        uid: userDoc.data()!.uid,
      }
    : null;
};

export const checkIfUserExists = async (database: Database, userId: UserId) => {
  logger.debug(`checking whether user ${userId} exists`);
  const user = await getUser(database, userId);
  if (user) {
    logger.debug(`${userId} is an existing user`);
  } else {
    logger.debug(`${userId} is not an existing user`);
  }
};

/*
      async function createNewAccount(database: Database, authState: AuthState) {
  const logger = log.getLogger("MainView::createNewAccount");
  const newUserRecord = { userName: authState.email };
  logger.debug(`adding user ${newUserRecord.userName}`);
  await database.addUser(newUserRecord);
  logger.debug(`added user ${newUserRecord.userName}`);
}
*/
