import { useState } from "react";
import {
  FollowablePostCallbacks,
  FollowablePostViewState,
} from "../../services/follows/Types";
import { PostId } from "../../services/store/Posts";
import { UserId } from "../../services/store/Users";
import { usePostIsFollowable } from "./usePostIsFollowable";

export const useFollowablePostViewState = (
  followablePostCallbacks: FollowablePostCallbacks,
  postAuthorId: UserId,
  postId: PostId
): FollowablePostViewState => {
  const [followCount, setFollowCount] = useState(0);
  const [isFollowedByViewer, setIsFollowedByViewer] = useState(false);

  return {
    followCount: followCount,
    isFollowableByViewer: usePostIsFollowable(postAuthorId),
    isFollowedByViewer: isFollowedByViewer,
    setFollowed: followablePostCallbacks.setPostFollowed,
  };
};
