import firebase from "firebase";
import * as log from "loglevel";
import { assertNever } from "../../utils";
import { Database } from "./Database";

export type FollowType = "post";

export interface FollowRecord {
  followedId: string;
  followType: FollowType;
}

const FOLLOW_RECORD_CONVERTER = {};

// The follows collection for a user is stored under their user object.
export const FOLLOWS_COLLECTION = "follows";
