import * as log from "loglevel";
import { Database } from "./Database";

import firebase from "firebase";

export type UserId = string;

export interface UserRecord {
  uid: UserId;
  displayName: string;
}

const USER_RECORD_CONVERTER = {
  toFirestore: (ur: UserRecord): firebase.firestore.DocumentData => {
    return ur;
  },
  fromFirestore: (
    snapshot: firebase.firestore.QueryDocumentSnapshot,
    options: firebase.firestore.SnapshotOptions
  ): UserRecord => {
    const data = snapshot.data(options)!;
    return {
      uid: data.uid,
      displayName: data.displayName,
    };
  },
};

export const USERS_COLLECTION = "users";

export const getUser = async (
  database: Database,
  uid: UserId
): Promise<UserRecord | null> => {
  const logger = log.getLogger("getUser");

  logger.debug(`Fetching user ${uid}`);
  const userDoc = await database
    .getHandle()
    .collection(USERS_COLLECTION)
    .withConverter(USER_RECORD_CONVERTER)
    .doc(uid)
    .get();

  return userDoc.exists ? userDoc.data()! : null;
};

export const checkIfUserExists = async (
  database: Database,
  uid: UserId
): Promise<boolean> => {
  const logger = log.getLogger("checkIfUserExists");

  logger.debug(`checking whether user ${uid} exists`);
  const user = await getUser(database, uid);
  if (!!user) {
    logger.debug(`${uid} is an existing user`);
  } else {
    logger.debug(`${uid} is not an existing user`);
  }
  return !!user;
};

const authedUserToNewUserRecord = (authedUser: firebase.User): UserRecord => {
  if (!authedUser.displayName) {
    throw new Error("Authed user display name should not be missing");
  }

  return {
    uid: authedUser.uid,
    displayName: authedUser.displayName,
  };
};

export const createNewUserRecord = async (
  database: Database,
  authedUser: firebase.User
): Promise<void> => {
  const logger = log.getLogger("createNewUserRecord");

  logger.debug(
    `creating new user record for user ${authedUser.uid}: ${authedUser.email} `
  );
  const doc = database
    .getHandle()
    .collection(USERS_COLLECTION)
    .withConverter(USER_RECORD_CONVERTER)
    .doc(authedUser.uid);
  await doc.set(authedUserToNewUserRecord(authedUser));
  logger.debug(
    `done creating new user record for user ${authedUser.uid}: ${authedUser.email} `
  );
};
