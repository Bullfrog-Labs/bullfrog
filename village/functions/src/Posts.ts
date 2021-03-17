import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { HttpsError } from "firebase-functions/lib/providers/https";
import {
  followerPostFollowEntryPath,
  postFollowsCollPath,
  postPath,
} from "./FirestoreSchema";

const cleanupPostFollows = async (
  db: admin.firestore.Firestore,
  userId: string,
  postId: string
) => {
  // taken from https://firebase.google.com/docs/firestore/manage-data/delete-data#node.js_2.
  const batchSize = 100;
  const followsCollRef = db.collection(
    postFollowsCollPath({ userId: userId, postId: postId })
  );
  const query = followsCollRef.orderBy("__name__").limit(batchSize);

  const batchDelete = async () => {
    const snapshot = await query.get();
    const resultSize = snapshot.size;

    if (resultSize === 0) {
      // no documents left, therefore we are done
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      const followerId = doc.id;
      const followerPostFollowDocRef = db.doc(
        followerPostFollowEntryPath({ followerId: followerId, postId: postId })
      );
      batch.delete(followerPostFollowDocRef); // delete the follow on the follower
      batch.delete(doc.ref); // delete the follow on the post
    });
    await batch.commit();

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(batchDelete);
  };

  await batchDelete();
};

type PostDeleteFailReasonPostDoesNotExist = "post-does-not-exist";
type PostDeleteFailReason = PostDeleteFailReasonPostDoesNotExist;

type PostDeleteFail = {
  state: "failure";
  reason: PostDeleteFailReason;
};

type PostDeleteSuccess = {
  state: "success";
};

type PostDeleteResponse = PostDeleteSuccess | PostDeleteFail;

const postDelete = async (
  db: admin.firestore.Firestore,
  userId: string,
  postId: string
): Promise<PostDeleteResponse> => {
  // This GCF deletes the post's follows and then deletes the post itself. If
  // the number of post follows is particularly large, it may timeout before
  // completion. It would have to be pretty big to timeout with the default 1
  // minute timeout. It should be sufficient for now and the timeout can be
  // extended up to 9 minutes if needed.
  // i.e. based on
  // https://firebase.google.com/docs/firestore/solutions/delete-collections#limitations,
  // it should not be difficult to set up the function to be able to delete 2M
  // post follows in 9 minutes, which should be sufficient for our needs for a
  // long time.

  // check that post exists
  const followedPostDocRef = db.doc(
    postPath({ authorId: userId, postId: postId })
  );
  const followedPost = await followedPostDocRef.get();

  if (!followedPost.exists) {
    functions.logger.info(`${postId} by ${userId} does not exist, skipping`);
    return {
      state: "failure",
      reason: "post-does-not-exist",
    };
  }

  // clean up the post
  await followedPostDocRef.delete();

  // clean up follows
  await cleanupPostFollows(db, userId, postId);

  return { state: "success" };
};

export const handlePostDelete = async (
  db: admin.firestore.Firestore,
  userId: string,
  postId: string
): Promise<PostDeleteResponse> => {
  try {
    return await postDelete(db, userId, postId);
  } catch (e) {
    functions.logger.warn(
      `Encountered unknown error during post unfollow, ${e}`
    );
    throw new HttpsError("unknown", `Unknown error in post unfollow, ${e}`);
  }
};
