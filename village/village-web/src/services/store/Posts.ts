import * as log from "loglevel";
import { Database } from "./Database";
import firebase from "firebase";
import { UserRecord, UserId, USERS_COLLECTION, getUsersForIds } from "./Users";
import { RichText } from "../../components/richtext/Types";
import { Node } from "slate";
import { ELEMENT_MENTION } from "@blfrg.xyz/slate-plugins";

export type PostId = string;
export type PostTitle = string;
export type PostBody = RichText;

export interface PostRecord {
  id?: PostId; // should only be undefined for unsaved new posts
  updatedAt?: Date; // should only be undefined for unsaved new posts
  authorId: UserId;
  body: PostBody;
  title: PostTitle;
  mentions: string[];
}

/**
 * Model classes not directly represented in the database.
 */

export interface UserPost {
  user: UserRecord;
  post: PostRecord;
}

const POST_RECORD_CONVERTER = {
  toFirestore: (record: PostRecord): firebase.firestore.DocumentData => {
    return record;
  },
  fromFirestore: (
    snapshot: firebase.firestore.QueryDocumentSnapshot,
    options: firebase.firestore.SnapshotOptions
  ): PostRecord => {
    const data = snapshot.data(options)!;
    return {
      updatedAt: data.updatedAt,
      authorId: data.authorId,
      id: snapshot.id,
      body: data.body,
      title: data.title,
      mentions: data.mentions || [],
    };
  },
};

export const POSTS_COLLECTION = "posts";

const getPostCollectionForUserRef = (database: Database, uid: UserId) =>
  database
    .getHandle()
    .collection(USERS_COLLECTION)
    .doc(uid)
    .collection(POSTS_COLLECTION);

export type CreatePostResultSuccess = {
  state: "success";
  postId: PostId;
  postUrl: string;
};

export type CreatePostResultPostNameTaken = {
  state: "post-name-taken";
  postId: PostId;
};

export type CreatePostResult =
  | CreatePostResultSuccess
  | CreatePostResultPostNameTaken;

export type CreatePostFn = (
  newTitle: PostTitle,
  newBody: PostBody,
  postId?: string
) => Promise<CreatePostResult>;

export const createPost: (
  database: Database
) => (user: UserRecord) => CreatePostFn = (database) => (user) => async (
  newTitle,
  newBody,
  postId?: string
) => {
  const logger = log.getLogger("createPost");

  // Check whether a post with the title exists, and create a new post only if
  // there is not already an existing one.

  const postDoc = await getPostCollectionForUserRef(database, user.uid)
    .where("title", "==", newTitle)
    .withConverter(POST_RECORD_CONVERTER)
    .get();

  if (!postDoc.empty) {
    if (postDoc.size > 1) {
      logger.warn("More than one post found with the same title");
    }
    const postId = postDoc.docs[0].id;
    return {
      state: "post-name-taken",
      postId: postId,
    };
  }

  const newPostRecord: PostRecord = {
    authorId: user.uid,
    title: newTitle,
    body: newBody,
    mentions: [],
    updatedAt: new Date(),
  };
  let newPostDoc = null;
  let newPostId = postId;
  if (postId) {
    await getPostCollectionForUserRef(database, user.uid)
      .doc(postId)
      .set(newPostRecord);
  } else {
    newPostDoc = await getPostCollectionForUserRef(database, user.uid).add(
      newPostRecord
    );
    newPostId = newPostDoc.id;
  }

  if (!newPostId) {
    throw new Error("Missing post id!");
  }

  return {
    state: "success",
    postId: newPostId,
    postUrl: `/post/${user.uid}/${newPostId}`,
  };
};

export type RenamePostResultSuccess = {
  state: "success";
};

export type RenamePostResultPostNameTaken = {
  state: "post-name-taken";
  postId: PostId;
};

export type RenamePostResult =
  | RenamePostResultSuccess
  | RenamePostResultPostNameTaken;

export type RenamePostFn = (
  postId: PostId,
  newTitle: PostTitle
) => Promise<RenamePostResult>;

export const renamePost: (
  database: Database
) => (user: UserRecord) => RenamePostFn = (database) => (user) => async (
  postId,
  newTitle
) => {
  const logger = log.getLogger("renamePost");

  const postDoc = await getPostCollectionForUserRef(database, user.uid)
    .where("title", "==", newTitle)
    .withConverter(POST_RECORD_CONVERTER)
    .get();

  if (!postDoc.empty) {
    if (postDoc.size > 1) {
      logger.warn("More than one post found with the same title");
    }
    const postRecord = postDoc.docs[0].data();
    return {
      state: "post-name-taken",
      postId: postRecord.id!,
    };
  }

  // TODO: Figure out how to check for failures
  await getPostCollectionForUserRef(database, user.uid)
    .doc(postId)
    .update({ title: newTitle, updatedAt: new Date() });

  return {
    state: "success",
  };
};

export type SyncBodyResult = "success" | "failure";
export type SyncBodyFn = (
  postId: PostId,
  newBody: PostBody
) => Promise<SyncBodyResult>;

export const syncBody: (
  database: Database
) => (user: UserRecord) => SyncBodyFn = (database) => (user) => async (
  postId,
  newBody
) => {
  const logger = log.getLogger("syncBody");

  const mentionIds = Array.from(Node.elements(newBody[0]))
    .filter((n) => n[0]["type"] === ELEMENT_MENTION)
    .map((n) => {
      if (!n[0]["postId"]) {
        logger.warn(`Invalid mention node ${JSON.stringify(n[0])}`);
      }
      return n[0]["postId"];
    });

  logger.debug(`Saving ${mentionIds.length} mentions`);

  // TODO: Figure out how to check for failures
  await getPostCollectionForUserRef(database, user.uid)
    .doc(postId)
    .update({
      body: newBody,
      updatedAt: new Date(),
      mentions: mentionIds as string[],
    });
  return "success";
};

export type GetPostFn = (
  uid: UserId,
  postId: PostId
) => Promise<PostRecord | undefined>;

export const getPost: (database: Database) => GetPostFn = (database) => async (
  uid,
  postId
) => {
  const logger = log.getLogger("getPost");

  logger.debug(`Fetching post ${postId} for user ${uid}`);
  const postDoc = await database
    .getHandle()
    .collection(USERS_COLLECTION)
    .doc(uid)
    .collection(POSTS_COLLECTION)
    .doc(postId)
    .withConverter(POST_RECORD_CONVERTER)
    .get();

  const postRecord = postDoc.data();
  if (!postRecord) {
    logger.debug(`Post ${postId} not found for user ${uid}`);
    return undefined;
  }

  return postRecord;
};

export const getUserPosts = (database: Database) => async (
  uid: UserId
): Promise<PostRecord[]> => {
  const logger = log.getLogger("getUserPosts");

  logger.debug(`Fetching user posts for user ${uid}`);
  const postsDoc = await database
    .getHandle()
    .collection(USERS_COLLECTION)
    .doc(uid)
    .collection(POSTS_COLLECTION)
    .withConverter(POST_RECORD_CONVERTER)
    .get();

  return postsDoc.docs.map((doc) => {
    return doc.data();
  });
};

export type GetUserPostsFn = ReturnType<typeof getUserPosts>;

const getPostsForTitle = async (
  database: Database,
  title: string
): Promise<PostRecord[]> => {
  const logger = log.getLogger("getPostsForTitle");

  logger.debug(`Fetching posts for title ${title}`);
  const postsDoc = await database
    .getHandle()
    .collectionGroup(POSTS_COLLECTION)
    .where("title", "==", title)
    .withConverter(POST_RECORD_CONVERTER)
    .get();

  return postsDoc.docs.map((doc) => {
    return doc.data();
  });
};

export const getUserPostsForPosts = async (
  database: Database,
  posts: PostRecord[]
): Promise<UserPost[]> => {
  const postUserIds: UserId[] = [];
  posts.forEach((post) => {
    postUserIds.push(post.authorId);
  });
  const users = await getUsersForIds(database, postUserIds);

  return posts.map((post) => {
    const user = users.find((u) => u.uid === post.authorId);
    if (!user) {
      throw new Error("Missing user for post!");
    }
    return {
      user: user,
      post: post,
    };
  });
};

export const getStackPosts = (database: Database) => async (
  title: string
): Promise<UserPost[]> => {
  const logger = log.getLogger("getStackPosts");

  logger.debug(`Fetching posts for title ${title}`);
  const posts = await getPostsForTitle(database, title);
  return getUserPostsForPosts(database, posts);
};

export type GetStackPostsFn = ReturnType<typeof getStackPosts>;

export const getAllPostsByTitlePrefix = (database: Database) => async (
  titlePrefix: string
): Promise<UserPost[]> => {
  const logger = log.getLogger("getGlobalMentions");

  logger.debug(`Fetching posts for title ${titlePrefix}`);
  const postsDoc = await database
    .getHandle()
    .collectionGroup(POSTS_COLLECTION)
    .where("title", ">=", titlePrefix)
    .where("title", "<", `${titlePrefix}\uf8ff`)
    .limit(10)
    .withConverter(POST_RECORD_CONVERTER)
    .get();

  const posts = postsDoc.docs.map((doc) => {
    return doc.data();
  });

  return getUserPostsForPosts(database, posts);
};

export type GetAllPostsByTitlePrefixFn = ReturnType<
  typeof getAllPostsByTitlePrefix
>;

export const getPostsForIds = (database: Database) => async (
  postIds: PostId[]
): Promise<PostRecord[]> => {
  if (postIds.length === 0) {
    return [];
  }

  const postsDoc = await database
    .getHandle()
    .collectionGroup(POSTS_COLLECTION)
    .where("id", "in", postIds)
    .withConverter(POST_RECORD_CONVERTER)
    .get();

  const posts = postsDoc.docs.map((doc) => {
    return doc.data();
  });

  return posts;
};

export const getUserPostsForIds = (database: Database) => async (
  postIds: PostId[]
): Promise<UserPost[]> => {
  const logger = log.getLogger("getUserPostsForIds");

  logger.debug(`Fetching posts for ids ${postIds.length}`);
  const posts = await getPostsForIds(database)(postIds);
  return getUserPostsForPosts(database, posts);
};

export type GetUserPostsForIdsFn = ReturnType<typeof getUserPostsForIds>;

export const getMentionPosts = (database: Database) => async (
  postId: PostId
): Promise<PostRecord[]> => {
  const postsDoc = await database
    .getHandle()
    .collectionGroup(POSTS_COLLECTION)
    .where("mentions", "array-contains", postId)
    .withConverter(POST_RECORD_CONVERTER)
    .get();

  const posts = postsDoc.docs.map((doc) => {
    return doc.data();
  });

  return posts;
};

export const getMentionUserPosts = (database: Database) => async (
  postId: PostId
): Promise<UserPost[]> => {
  const logger = log.getLogger("getMentions");

  logger.debug(`Fetching mentions for id ${postId}`);
  const posts = await getMentionPosts(database)(postId);
  return getUserPostsForPosts(database, posts);
};

export type GetMentionUserPostsFn = ReturnType<typeof getMentionUserPosts>;
