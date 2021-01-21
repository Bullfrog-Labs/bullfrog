import { PostId } from "../services/store/Posts";
import { UserId } from "../services/store/Users";
import { Path } from "history";

export const postURL = (authorUsername: UserId, postId: PostId): Path =>
  `/post/${authorUsername}/${postId}`;
