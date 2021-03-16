import firebase from "firebase";
import { assertNever } from "../../utils";
import { GetUserFollowsPostFn, SetPostFollowedFn } from "../follows/Types";
import { Database } from "./Database";
import { PostId } from "./Posts";
import { UserId, UserRecord, USERS_COLLECTION } from "./Users";

export type PostFollowType = "post";
export type FollowType = PostFollowType;

export interface FollowRecord {
  followType: FollowType;
  followedOn: Date;
}

const FOLLOW_RECORD_CONVERTER = {
  toFirestore: (record: FollowRecord): firebase.firestore.DocumentData => {
    const firestoreRecord: firebase.firestore.DocumentData = Object.assign(
      {},
      record
    );
    return firestoreRecord;
  },
  fromFirestore: (
    snapshot: firebase.firestore.QueryDocumentSnapshot,
    options: firebase.firestore.SnapshotOptions
  ): FollowRecord => {
    const data = snapshot.data(options);
    return {
      followType: data.followType,
      followedOn: data.followedOn,
    };
  },
};

// The follows collection for a user is stored under their user object.
const FOLLOWS_COLLECTION = "follows";

export const addPostToUserFollows = (database: Database) => (uid: UserId) => (
  postId: PostId
) => {};

export const removePostFromUserFollows = (database: Database) => (
  uid: UserId
) => (postId: PostId) => {};

export const setPostFollowed = (database: Database) => (
  ur: UserRecord
): SetPostFollowedFn => (postId, isFollowed) => {};

export const getUserFollowsPost = (database: Database) => (
  ur: UserRecord
): GetUserFollowsPostFn => async (postId: PostId) => {
  const followDoc = await database
    .getHandle()
    .collection(USERS_COLLECTION)
    .doc(ur.uid)
    .collection(FOLLOWS_COLLECTION)
    .doc(postId)
    .withConverter(FOLLOW_RECORD_CONVERTER)
    .get();

  const followRecord = followDoc.data();
  if (!followRecord) {
    return false;
  }

  switch (followRecord.followType) {
    case "post":
      return true;
    default:
      assertNever(followRecord.followType);
  }
};
