import firebase from "firebase";
import { Activity } from "../activities/Types";
import { Database } from "./Database";
import { UserId, UserRecord } from "./Users";

export const notificationFeedPathForUser = (userId: UserId) =>
  `/users/${userId}/notifications`;

const ACTIVITY_RECORD_CONVERTER = {
  toFirestore: (record: Activity): firebase.firestore.DocumentData => {
    const firestoreRecord: firebase.firestore.DocumentData = Object.assign(
      {},
      record
    );
    return firestoreRecord;
  },
  fromFirestore: (
    snapshot: firebase.firestore.QueryDocumentSnapshot,
    options: firebase.firestore.SnapshotOptions
  ): Activity => {
    const data = snapshot.data(options);
    return data as Activity;
  },
};

export type ActivityFeedCursor = firebase.firestore.DocumentSnapshot;
export type CursoredActivity = {
  activity: Activity;
  cursor: ActivityFeedCursor;
};
export type GetCursoredActivitiesFromFeedFn = (
  limit: number,
  startAfter?: ActivityFeedCursor
) => Promise<CursoredActivity[]>;

export const getCursoredActivitiesFromFeed = (db: Database) => (
  userRecord: UserRecord
): GetCursoredActivitiesFromFeedFn => async (limit, startAfter?) => {
  const notificationFeedPath = notificationFeedPathForUser(userRecord.uid);
  let notificationsCollRef = db
    .getHandle()
    .collection(notificationFeedPath)
    .orderBy("createdAt", "desc")
    .withConverter(ACTIVITY_RECORD_CONVERTER);
  if (!!startAfter) {
    notificationsCollRef = notificationsCollRef.startAfter(startAfter);
  }
  notificationsCollRef = notificationsCollRef.limit(limit);

  const querySnapshot = await notificationsCollRef.get();
  const result: CursoredActivity[] = [];
  querySnapshot.forEach((doc) => {
    result.push({ activity: doc.data(), cursor: doc });
  });
  return result;
};
