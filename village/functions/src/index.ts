import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { HttpsError } from "firebase-functions/lib/providers/https";
import { allPostFollowsWildcard } from "./FirestoreSchema";
import {
  buildNewPostFollowEntryHandler,
  handlePostFollow,
  handlePostUnfollow,
} from "./Follows";
import { downloadAllPostsAsMD, handlePostDelete } from "./Posts";
import { buildPrerenderProxyApp } from "./PrerenderProxy";
import { lookupTwitterUserById } from "./Twitter";

admin.initializeApp();
const db: admin.firestore.Firestore = admin.firestore();

export const lookupTwitterUser = functions.https.onCall(
  async (data, context) => {
    const id = data.id as string;

    if (!id) {
      throw new Error("id not provided in query");
    }

    if (!context.auth) {
      throw new Error("auth should not be null");
    }

    const result = await lookupTwitterUserById(id!);
    return result;
  }
);

export const prerenderProxy = functions.https.onRequest(
  buildPrerenderProxyApp()
);

export const followPost = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  const authorId = data.authorId;
  const postId = data.postId;

  if (!uid) {
    throw new Error("uid not provided");
  }

  if (!authorId) {
    throw new Error("authorId not provided");
  }

  if (!postId) {
    throw new Error("postId not provided");
  }

  const result = await handlePostFollow(db, uid, authorId, postId);
  return result;
});

export const newPostFollowEntryHandler = functions.firestore
  .document(allPostFollowsWildcard)
  .onCreate(buildNewPostFollowEntryHandler(db));

export const unfollowPost = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  const authorId = data.authorId;
  const postId = data.postId;

  if (!uid) {
    throw new Error("uid not provided");
  }

  if (!authorId) {
    throw new Error("authorId not provided");
  }

  if (!postId) {
    throw new Error("postId not provided");
  }

  const result = await handlePostUnfollow(db, uid, authorId, postId);
  return result;
});

export const deletePost = functions.https.onCall(async (data, context) => {
  const userId = context.auth?.uid;
  const postId = data.postId;

  if (!userId) {
    throw new Error("uid not provided");
  }

  if (!postId) {
    throw new Error("postId not provided");
  }

  const result = await handlePostDelete(db, userId, postId);
  return result;
});

export const exportAllPostsAsMD = functions.https.onCall(
  async (data, context) => {
    const userId = context.auth?.uid;
    if (!userId) {
      throw new Error("uid not provided");
    }

    try {
      return await downloadAllPostsAsMD(db, userId);
    } catch (e) {
      functions.logger.warn(
        `Encountered unknown error during export all posts, ${e}`
      );
      throw new HttpsError(
        "unknown",
        `Unknown error in exporting all posts, ${e}`
      );
    }
  }
);
