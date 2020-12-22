import * as log from "loglevel";
import { Database } from "./Database";
import firebase from "firebase";
import { UserRecord, UserId } from "./Users";

export interface PostRecord {
  updatedAt: Date;
  userId: UserId;
  id: string;
  body: string;
  title: string;
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
      userId: data.userId,
      id: data.id,
      body: data.body,
      title: data.title,
    };
  },
};

export const POSTS_COLLECTION = "posts";
