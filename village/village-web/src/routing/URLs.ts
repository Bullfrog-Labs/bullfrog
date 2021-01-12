import { PostId } from "../services/store/Posts";
import { UserId } from "../services/store/Users";
import { Path } from "history";

export const postURL = (authorId: UserId, postId: PostId): Path =>
  `/post/${authorId}/${postId}`;
