import { useEffect, useState } from "react";
import {
  FollowablePostCallbacks,
  FollowablePostViewState,
} from "../../services/follows/Types";
import { PostId } from "../../services/store/Posts";
import { UserId } from "../../services/store/Users";
import { usePostIsFollowable } from "./usePostIsFollowable";

export const useFollowablePostViewState = (
  followablePostCallbacks: FollowablePostCallbacks,
  followCount: number,
  postAuthorId: UserId,
  postId: PostId
): FollowablePostViewState => {
  const [isFollowedByViewer, setIsFollowedByViewer] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

    const loadIsFollowedByViewer = async () => {
      const result = await followablePostCallbacks.getUserFollowsPost!(postId);
      if (!isSubscribed) {
        return;
      }
      setIsFollowedByViewer(result);
    };

    loadIsFollowedByViewer();

    return () => {
      isSubscribed = false;
    };
  }, [followablePostCallbacks.getUserFollowsPost, postId]);

  return {
    followCount: followCount,
    isFollowableByViewer: usePostIsFollowable(postAuthorId),
    isFollowedByViewer: isFollowedByViewer,
    setFollowed: followablePostCallbacks.setPostFollowed,
  };
};
