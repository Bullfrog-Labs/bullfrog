import * as log from "loglevel";
import { Database } from "./Database";
import firebase from "firebase";
import { UserRecord } from "./Users";

export interface PostRecord {
  updatedAt: Date;
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
