import { PostId } from "../store/Posts";

export type SetPostFollowedFn = (postId: PostId, isFollowed: boolean) => void;
export type GetUserFollowsPostFn = (postId: PostId) => void;
export type GetPostFollowCountFn = (postId: PostId) => number;

export type FollowablePostCallbacks = {
  getPostFollowCount: GetPostFollowCountFn; // always available

  // only available is user is logged in and post is followable by that user
  setPostFollowed?: SetPostFollowedFn;
  getUserFollowsPost?: GetUserFollowsPostFn;
};
