import * as log from "loglevel";
import { Database } from "./Database";
import firebase from "firebase";
import { UserRecord, UserId, USERS_COLLECTION, getUsersForIds } from "./Users";
import { RichText } from "../../components/richtext/Types";
import { Node } from "slate";
import { ELEMENT_MENTION } from "@blfrg.xyz/slate-plugins";
import { postURL } from "../../routing/URLs";
import { EMPTY_RICH_TEXT } from "../../components/richtext/Utils";

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
  followCount: number;
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
    const firestoreRecord: firebase.firestore.DocumentData = Object.assign(
      {},
      record
    );
    firestoreRecord.caseInsensitiveTitle = firestoreRecord.title.toLowerCase();
    return firestoreRecord;
  },
  fromFirestore: (
    snapshot: firebase.firestore.QueryDocumentSnapshot,
    options: firebase.firestore.SnapshotOptions
  ): PostRecord => {
    const data = snapshot.data(options)!;
    return {
      updatedAt: data.updatedAt?.toDate(),
      authorId: data.authorId,
      id: snapshot.id,
      body: data.body,
      title: data.title,
      mentions: data.mentions || [],
      followCount: data.followCount || 0,
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

const getPostsForTitleAndUser = async (
  database: Database,
  uid: UserId,
  title: PostTitle
) => {
  const logger = log.getLogger("getPostForTitleAndUser");

  const postDoc = await getPostCollectionForUserRef(database, uid)
    .where("title", "==", title)
    .withConverter(POST_RECORD_CONVERTER)
    .get();

  if (postDoc.size > 1) {
    logger.warn("More than one post found with the same title");
  }

  return postDoc;
};

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

export type CreatePostFnArgs = {
  newTitle: PostTitle;
  newBody?: PostBody;
  postId?: PostId;
};

export type CreatePostFn = (
  args: CreatePostFnArgs
) => Promise<CreatePostResult>;

export const createPost: (
  database: Database
) => (user: UserRecord) => CreatePostFn = (database) => (user) => async (
  args
) => {
  const { newTitle, newBody, postId } = args;

  // Check whether a post with the title exists, and create a new post only if
  // there is not already an existing one.
  const matches = await getPostsForTitleAndUser(database, user.uid, newTitle);
  if (!matches.empty) {
    const postId = matches.docs[0].id;
    return {
      state: "post-name-taken",
      postId: postId,
    };
  }

  const newPostRecord: PostRecord = {
    authorId: user.uid,
    title: newTitle,
    body: newBody ?? EMPTY_RICH_TEXT,
    mentions: [],
    updatedAt: new Date(),
    followCount: 0,
  };
  let newPostDoc = null;
  let newPostId = postId;
  if (postId) {
    await getPostCollectionForUserRef(database, user.uid)
      .doc(postId)
      .withConverter(POST_RECORD_CONVERTER)
      .set(newPostRecord);
  } else {
    newPostDoc = await getPostCollectionForUserRef(database, user.uid)
      .withConverter(POST_RECORD_CONVERTER)
      .add(newPostRecord);
    newPostId = newPostDoc.id;
  }

  if (!newPostId) {
    throw new Error("Missing post id!");
  }

  return {
    state: "success",
    postId: newPostId,
    postUrl: postURL(user.username, newPostId),
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
  // Check whether a post with the title exists, and create a new post only if
  // there is not already an existing one.
  const matches = await getPostsForTitleAndUser(database, user.uid, newTitle);
  if (!matches.empty) {
    const postId = matches.docs[0].id;
    return {
      state: "post-name-taken",
      postId: postId,
    };
  }

  // TODO: Figure out how to check for failures
  await getPostCollectionForUserRef(database, user.uid).doc(postId).update({
    title: newTitle,
    caseInsensitiveTitle: newTitle.toLowerCase(),
    updatedAt: new Date(),
  });

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
    .orderBy("updatedAt", "desc")
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
    .orderBy("updatedAt", "desc")
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

export const deletePost = (database: Database) => async (
  userId: UserId,
  postId: PostId
): Promise<void> => {
  const logger = log.getLogger("deletePost");

  logger.debug(`Deleting post with id ${postId}`);
  await database
    .getHandle()
    .collection(USERS_COLLECTION)
    .doc(userId)
    .collection(POSTS_COLLECTION)
    .doc(postId)
    .delete();
};

export type DeletePostFn = ReturnType<typeof deletePost>;
