import * as functions from "firebase-functions";
import { lookupTwitterUserById } from "./Twitter";
import { buildPrerenderProxyApp } from "./PrerenderProxy";
import { handlePostFollow, handlePostUnfollow } from "./Follows";

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

  const result = await handlePostFollow(uid, authorId, postId);
  return result;
});

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

  const result = await handlePostUnfollow(uid, authorId, postId);
  return result;
});
