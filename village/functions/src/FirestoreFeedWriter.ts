import * as admin from "firebase-admin";
import { Activity, ActivityId, TimestampedActivity } from "./Activities";

const activityPathFromFeedPath = (feedPath: string, activityId: ActivityId) =>
  `${feedPath}/${activityId}`;

export const isActivityPresent = async (
  db: admin.firestore.Firestore,
  feedPath: string,
  activityId: ActivityId
): Promise<boolean> => {
  const activityDocRef = db.doc(activityPathFromFeedPath(feedPath, activityId));
  const activityDoc = await activityDocRef.get();
  return activityDoc.exists;
};

export const pushActivity = async (
  db: admin.firestore.Firestore,
  feedPath: string,
  activityId: ActivityId,
  activity: Activity
): Promise<void> => {
  // Create timestamp for feed ordering
  const createdAtSentinel = admin.firestore.FieldValue.serverTimestamp();
  const timestampedActivity: TimestampedActivity = {
    ...activity,
    createdAt: createdAtSentinel,
  };

  await db
    .doc(activityPathFromFeedPath(feedPath, activityId))
    .set(timestampedActivity);
};
