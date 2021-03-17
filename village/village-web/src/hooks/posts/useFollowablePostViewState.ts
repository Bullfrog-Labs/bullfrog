import * as log from "loglevel";
import { useEffect, useState } from "react";
import {
  FollowablePostCallbacks,
  FollowablePostViewState,
  ListenerUnsubscribeFn,
} from "../../services/follows/Types";
import { PostId } from "../../services/store/Posts";
import { UserId } from "../../services/store/Users";
import { usePostIsFollowable } from "./usePostIsFollowable";

export const useFollowablePostViewState = (
  followCount: number,
  postAuthorId: UserId,
  postId: PostId,
  followablePostCallbacks: FollowablePostCallbacks
): FollowablePostViewState => {
  const [isFollowedByViewer, setIsFollowedByViewer] = useState<
    boolean | undefined
  >(false);
  const logger = log.getLogger("useFollowablePostViewState");
  const isFollowableByViewer = usePostIsFollowable(postAuthorId);

  useEffect(() => {
    let unsubscribe: ListenerUnsubscribeFn | undefined = undefined;

    if (isFollowableByViewer) {
      if (!followablePostCallbacks.listenForUserPostFollow) {
        throw new Error(
          "Post is followable by viewer, but listenForUserPostFollow is undefined"
        );
      }

      const listenIsFollowedByViewer = async () => {
        unsubscribe = followablePostCallbacks.listenForUserPostFollow!(
          postId,
          (snapshot) => {
            setIsFollowedByViewer(!!snapshot.data());
          },
          (error) => {
            logger.error(error.message);
          }
        );
      };
      listenIsFollowedByViewer();
    } else {
      setIsFollowedByViewer(undefined);
    }

    return () => {
      if (!!unsubscribe) {
        unsubscribe();
      }
    };
  }, [followablePostCallbacks, isFollowableByViewer, logger, postId]);

  return {
    followCount: followCount,
    isFollowableByViewer: usePostIsFollowable(postAuthorId),
    isFollowedByViewer: isFollowedByViewer,
    setFollowed: followablePostCallbacks.setPostFollowed,
  };
};
