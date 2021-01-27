import firebase from "firebase";
import * as log from "loglevel";
import { AuthProviderState } from "../auth/Auth";
import { Database } from "./Database";

export type UserId = string;

export interface UserRecord {
  uid: UserId;
  displayName: string;
  username: string;
  description?: string;
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
      username: data.username,
      description: data.description,
    };
  },
};

export const USERS_COLLECTION = "users";

export const getUser = (database: Database) => async (
  uid: UserId
): Promise<UserRecord | undefined> => {
  const logger = log.getLogger("getUser");

  logger.debug(`Fetching user ${uid}`);
  const userDoc = await database
    .getHandle()
    .collection(USERS_COLLECTION)
    .withConverter(USER_RECORD_CONVERTER)
    .doc(uid)
    .get();

  return userDoc.exists ? userDoc.data()! : undefined;
};

export type GetUserFn = ReturnType<typeof getUser>;

export const getUserByUsername = (database: Database) => async (
  username: string
): Promise<UserRecord | undefined> => {
  const logger = log.getLogger("getUserByUsername");
  logger.debug(`Fetching user with username ${username}`);
  const userDocs = await database
    .getHandle()
    .collection(USERS_COLLECTION)
    .where("username", "==", username)
    .limit(1) // usernames are unique
    .withConverter(USER_RECORD_CONVERTER)
    .get();

  return userDocs.size === 0 ? undefined : userDocs.docs[0].data();
};

export type GetUserByUsernameFn = ReturnType<typeof getUserByUsername>;

export const getUsersForIds = async (
  database: Database,
  userIds: UserId[]
): Promise<UserRecord[]> => {
  const logger = log.getLogger("getUsersForIds");
  logger.debug(`Fetching posts for ids ${userIds}`);
  if (!userIds || userIds.length === 0) {
    return [];
  }
  const userDoc = await database
    .getHandle()
    .collection(USERS_COLLECTION)
    .where("uid", "in", userIds)
    .withConverter(USER_RECORD_CONVERTER)
    .get();

  return userDoc.docs.map((doc) => {
    return doc.data();
  });
};

export const checkIfUserExists = async (
  database: Database,
  uid: UserId
): Promise<boolean> => {
  const logger = log.getLogger("checkIfUserExists");

  logger.debug(`checking whether user ${uid} exists`);
  const user = await getUser(database)(uid);
  if (!!user) {
    logger.debug(`${uid} is an existing user`);
  } else {
    logger.debug(`${uid} is not an existing user`);
  }
  return !!user;
};

const authProviderStateToNewUserRecord = (
  authProviderState: AuthProviderState
): UserRecord => {
  if (!authProviderState.displayName) {
    throw new Error("Authed user display name should not be missing");
  }

  return {
    uid: authProviderState.uid,
    displayName: authProviderState.displayName,
    username: authProviderState.username,
  };
};

export const createNewUserRecord = async (
  database: Database,
  authProviderState: AuthProviderState
): Promise<void> => {
  const logger = log.getLogger("createNewUserRecord");

  logger.debug(`creating new user record for user ${authProviderState.uid}`);
  const doc = database
    .getHandle()
    .collection(USERS_COLLECTION)
    .withConverter(USER_RECORD_CONVERTER)
    .doc(authProviderState.uid);
  await doc.set(authProviderStateToNewUserRecord(authProviderState));
  logger.debug(
    `done creating new user record for user ${authProviderState.uid}`
  );
};
