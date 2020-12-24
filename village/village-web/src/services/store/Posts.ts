import * as log from "loglevel";
import { Database } from "./Database";
import firebase from "firebase";
import { UserRecord, UserId, USERS_COLLECTION, getUsersForIds } from "./Users";
import { RichText } from "../../components/richtext/Types";

export type PostId = string;
export type PostTitle = string;
export type PostBody = RichText;

export interface PostRecord {
  id?: PostId; // should only be undefined for unsaved new posts
  updatedAt?: Date; // should only be undefined for unsaved new posts
  authorId: UserId;
  body: PostBody;
  title: PostTitle;
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
      authorId: data.userId,
      id: data.id,
      body: data.body,
      title: data.title,
    };
  },
};

export const POSTS_COLLECTION = "posts";

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
  newBody: PostBody
) => Promise<CreatePostResult>;

export const createPost: (
  database: Database
) => (user: UserRecord) => CreatePostFn = (database) => (user) => async (
  newTitle,
  newBody
) => {
  const logger = log.getLogger("createPost");
  // Check whether a post with the title exists, and create a new post only if
  // there is not already an existing one.

  const getPostCollectionRef = () =>
    database
      .getHandle()
      .collection(USERS_COLLECTION)
      .doc(user.uid)
      .collection(POSTS_COLLECTION);

  const postDoc = await getPostCollectionRef()
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
  } else {
    const newPostRecord: PostRecord = {
      authorId: user.uid,
      title: newTitle,
      body: newBody,
      updatedAt: new Date(),
    };
    const newPostDoc = await getPostCollectionRef().add(newPostRecord);

    return {
      state: "success",
      postId: newPostDoc.id,
      postUrl: `/post/${user.uid}/${newPostDoc.id}`,
    };
  }
};

export type RenamePostResult = "success" | "post-name-taken";
export type RenamePostFn = (
  postId: PostId,
  newTitle: PostTitle
) => Promise<RenamePostResult>;

export type SyncBodyResult = "success" | "failure";
export type SyncBodyFn = (
  postId: PostId,
  newBody: PostBody
) => Promise<SyncBodyResult>;

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
    return undefined;
  }

  postRecord.id = postDoc.id;
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

export const getStackPosts = (database: Database) => async (
  title: string
): Promise<UserPost[]> => {
  const logger = log.getLogger("getStackPosts");

  logger.debug(`Fetching posts for title ${title}`);
  const posts = await getPostsForTitle(database, title);
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

export type GetStackPostsFn = ReturnType<typeof getStackPosts>;
