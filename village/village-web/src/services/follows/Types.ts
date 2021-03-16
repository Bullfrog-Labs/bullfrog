import { PostId } from "../store/Posts";

export type SetPostFollowedFn = (postId: PostId, isFollowed: boolean) => void;
export type GetUserFollowsPostFn = (postId: PostId) => Promise<boolean>;

export type FollowablePostCallbacks = {
  // only available is user is logged in and post is followable by that user
  setPostFollowed?: SetPostFollowedFn;
  getUserFollowsPost?: GetUserFollowsPostFn;
};

export type FollowablePostViewState = {
  followCount: number;
  isFollowedByViewer: boolean;
  isFollowableByViewer: boolean;

  // only available if followable by viewer
  setFollowed?: SetPostFollowedFn;
};
