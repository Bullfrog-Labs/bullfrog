import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { HttpsError } from "firebase-functions/lib/providers/https";

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
    const userPostFollowDocRef = db.doc(`/users/${uid}/follows/${postId}`);
    const followedPostDocRef = db.doc(`/users/${authorId}/posts/${postId}`);
    const followedPostFollowEntryDocRef = db.doc(
      `/users/${authorId}/posts/${postId}/follows/${uid}`
    );

    const userPostFollow = await transaction.get(userPostFollowDocRef);
    const followedPost = await transaction.get(followedPostDocRef);
    const followedOn = new Date();

    if (!followedPost.exists) {
      throw new Error("Tried to follow non-existent post!");
    }

    if (userPostFollow.exists) {
      functions.logger.info(`${postId} already followed by ${uid}, skipping`);
      const result: PostFollowFail = {
        state: "failure",
        reason: "already-followed",
      };
      return result;
    }

    // Reads
    const newFollowCount = followedPost.data()!.followCount + 1;

    // Write: Add follow entry for user
    transaction.create(userPostFollowDocRef, {
      followType: "post",
      followedOn: followedOn,
    });

    // Write: Add follow entry on followed post
    transaction.create(followedPostFollowEntryDocRef, {
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
    const userPostFollowDocRef = db.doc(`/users/${uid}/follows/${postId}`);
    const followedPostDocRef = db.doc(`/users/${authorId}/posts/${postId}`);
    const followedPostFollowEntryDocRef = db.doc(
      `/users/${authorId}/posts/${postId}/follows/${uid}`
    );

    const userPostFollow = await transaction.get(userPostFollowDocRef);
    const followedPost = await transaction.get(followedPostDocRef);

    if (!userPostFollow.exists) {
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
    transaction.delete(userPostFollowDocRef);

    // Write: Remove follow entry on followed post
    transaction.delete(followedPostFollowEntryDocRef);

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
