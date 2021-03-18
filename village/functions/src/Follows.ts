import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { EventContext } from "firebase-functions";
import { QueryDocumentSnapshot } from "firebase-functions/lib/providers/firestore";
import { HttpsError } from "firebase-functions/lib/providers/https";
import { postFollowActivity, UserRecord } from "./Activities";
import { isActivityPresent, pushActivity } from "./FirestoreFeedWriter";
import {
  getPostFollowEntryPaths,
  notificationFeedPathForUser,
  postPath,
  userPath,
} from "./FirestoreSchema";
import { getPostFollowEntryPaths, postPath } from "./FirestoreSchema";

type PostFollowFailAlreadyFollowed = "already-followed";
type PostFollowFailReason = PostFollowFailAlreadyFollowed;

type PostFollowFail = {
  state: "failure";
  reason: PostFollowFailReason;
};

type PostFollowSuccess = {
  state: "success";
};

type PostFollowResponse = PostFollowSuccess | PostFollowFail;

export const handlePostFollow = async (
  db: admin.firestore.Firestore,
  uid: string,
  authorId: string,
  postId: string
): Promise<PostFollowResponse> => {
  const postFollowTransaction = async (
    transaction: admin.firestore.Transaction
  ) => {
    const postFollowEntryPaths = getPostFollowEntryPaths({
      followerId: uid,
      authorId: authorId,
      postId: postId,
    });
    const postFollowEntryDocRef = db.doc(postFollowEntryPaths.postFollowEntry);
    const followerPostFollowEntryDocRef = db.doc(
      postFollowEntryPaths.followerPostFollowEntry
    );

    const followedPostDocRef = db.doc(
      postPath({ authorId: authorId, postId: postId })
    );

    const followerPostFollowEntry = await transaction.get(
      followerPostFollowEntryDocRef
    );
    const followedPost = await transaction.get(followedPostDocRef);
    const followedOn = new Date();

    if (!followedPost.exists) {
      throw new Error("Tried to follow non-existent post!");
    }

    if (followerPostFollowEntry.exists) {
      functions.logger.info(`${postId} already followed by ${uid}, skipping`);
      const result: PostFollowFail = {
        state: "failure",
        reason: "already-followed",
      };
      return result;
    }

    // Reads
    const newFollowCount = (followedPost.data()!.followCount ?? 0) + 1;

    // Write: Add follow entry for user
    transaction.create(followerPostFollowEntryDocRef, {
      followType: "post",
      followedOn: followedOn,
    });

    // Write: Add follow entry on followed post
    transaction.create(postFollowEntryDocRef, {
      followedOn: followedOn,
    });

    // Write: Increment follow count on followed post
    transaction.update(followedPostDocRef, { followCount: newFollowCount });

    return {
      state: "success",
    } as PostFollowSuccess;
  };

  try {
    return await db.runTransaction(postFollowTransaction);
  } catch (e) {
    functions.logger.warn(`Encountered unknown error during post follow, ${e}`);
    throw new HttpsError("unknown", "Unknown error in post follow");
  }
};

type PostUnfollowFailAlreadyFollowed = "already-unfollowed";
type PostUnfollowFailReason = PostUnfollowFailAlreadyFollowed;

type PostUnfollowFail = {
  state: "failure";
  reason: PostUnfollowFailReason;
};

type PostUnfollowSuccess = {
  state: "success";
};

export type PostUnfollowResponse = PostUnfollowSuccess | PostUnfollowFail;

export const handlePostUnfollow = async (
  db: admin.firestore.Firestore,
  uid: string,
  authorId: string,
  postId: string
): Promise<PostUnfollowResponse> => {
  const postUnfollowTransaction = async (
    transaction: admin.firestore.Transaction
  ) => {
    const postFollowEntryPaths = getPostFollowEntryPaths({
      followerId: uid,
      authorId: authorId,
      postId: postId,
    });

    const followerPostFollowEntryDocRef = db.doc(
      postFollowEntryPaths.followerPostFollowEntry
    );
    const postFollowEntryDocRef = db.doc(postFollowEntryPaths.postFollowEntry);

    const followedPostDocRef = db.doc(
      postPath({ authorId: authorId, postId: postId })
    );

    const followerPostFollowEntry = await transaction.get(
      followerPostFollowEntryDocRef
    );
    const followedPost = await transaction.get(followedPostDocRef);

    if (!followerPostFollowEntry.exists) {
      functions.logger.info(
        `${postId} already not followed by ${uid}, skipping`
      );
      return {
        state: "failure",
        reason: "already-unfollowed",
      } as PostUnfollowFail;
    }

    if (!followedPost.exists) {
      throw new Error("Tried to unfollow non-existent post!");
    }

    // Reads
    const newFollowCount = followedPost.data()!.followCount - 1;

    // Write: Remove follow entry for user
    transaction.delete(followerPostFollowEntryDocRef);

    // Write: Remove follow entry on followed post
    transaction.delete(postFollowEntryDocRef);

    // Write: Decrement follow count on followed post
    transaction.update(followedPostDocRef, { followCount: newFollowCount });

    return {
      state: "success",
    } as PostUnfollowSuccess;
  };

  try {
    return await db.runTransaction(postUnfollowTransaction);
  } catch (e) {
    functions.logger.warn(
      `Encountered unknown error during post unfollow, ${e}`
    );
    throw new HttpsError("unknown", "Unknown error in post unfollow");
  }
};

export const buildNewPostFollowEntryHandler = (
  db: admin.firestore.Firestore
) => async (
  snapshot: QueryDocumentSnapshot,
  context: EventContext
): Promise<void> => {
  const { authorId, postId, followerId } = context.params;
  const activityId = context.eventId;

  if (!authorId || !postId || !followerId) {
    throw new Error("authorId, postId or followerId not provided");
  }

  const notificationFeedPath = notificationFeedPathForUser(authorId);

  // Check that the event has not been processed yet, since this function must
  // be idempotent. Idempotence depends on eventId.
  if (await isActivityPresent(db, notificationFeedPath, activityId)) {
    functions.logger.info(
      `Activity with id ${activityId} already handled, skipping.`
    );
    return;
  }

  // Read PostRecord and UserRecord to populate activity content.
  const [postRecordDoc, userRecordDoc] = await Promise.all([
    db.doc(postPath({ authorId: authorId, postId: postId })).get(),
    db.doc(userPath(followerId)).get(),
  ]);

  if (!postRecordDoc.exists) {
    functions.logger.warn(
      `Post follow activity with id ${activityId} has non-existent post ${postId}`
    );
    return;
  }

  if (!userRecordDoc.exists) {
    functions.logger.warn(
      `Post follow activity with id ${activityId} has non-existent follower ${followerId}`
    );
    return;
  }

  const followerUserRecord = userRecordDoc.data() as UserRecord;

  // Write: Add activity to author's notification feed
  const activity = postFollowActivity({
    followerId: followerId,
    authorId: authorId,
    postId: postId,
    content: {
      title: postRecordDoc.data()!.title,
      follower: followerUserRecord,
    },
  });

  await pushActivity(db, notificationFeedPath, activityId, activity);
};
