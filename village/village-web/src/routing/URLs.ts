import { PostId } from "../services/store/Posts";
import { UserId } from "../services/store/Users";
import { Path } from "history";

export const postURL = (authorUsername: string, postId: PostId): Path =>
  `/post/${authorUsername}/${postId}`;

export const postURLById = (authorId: UserId, postId: PostId): Path =>
  `/post/${authorId}/${postId}?byId=1`;

export const profileURL = (username: string): Path => `/profile/${username}`;

export const notificationsURL = "/notifications";
