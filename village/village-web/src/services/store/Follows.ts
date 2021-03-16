import {
  GetPostFollowCountFn,
  GetUserFollowsPostFn,
  SetPostFollowedFn,
} from "../follows/Types";
import { Database } from "./Database";
import { PostId } from "./Posts";
import { UserId, UserRecord } from "./Users";

export type FollowType = "post";

export interface FollowRecord {
  followedId: string;
  followType: FollowType;
}

const FOLLOW_RECORD_CONVERTER = {};

// The follows collection for a user is stored under their user object.
export const FOLLOWS_COLLECTION = "follows";

export const addPostToUserFollows = (database: Database) => (uid: UserId) => (
  postId: PostId
) => {};

export const removePostFromUserFollows = (database: Database) => (
  uid: UserId
) => (postId: PostId) => {};

export const setPostFollowed = (database: Database) => (
  ur: UserRecord
): SetPostFollowedFn => (postId, isFollowed) => {};

export const getUserFollowsPost = (database: Database) => (
  ur: UserRecord
): GetUserFollowsPostFn => (postId: PostId) => {};

export const getPostFollowCount = (
  database: Database
): GetPostFollowCountFn => (postId) => 0;
