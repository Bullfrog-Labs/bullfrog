import firebase from "firebase";
import { PostId } from "../store/Posts";
import { UserId } from "../store/Users";

export type ListenerUnsubscribeFn = () => void;

export type SetPostFollowedFn = (
  authorId: UserId,
  postId: PostId,
  isFollowed: boolean
) => Promise<void>;
export type GetUserFollowsPostFn = (postId: PostId) => Promise<boolean>;
export type ListenForUserPostFollowFn = (
  postId: PostId,
  onNext: (snapshot: firebase.firestore.DocumentSnapshot) => void,
  onError?: (error: firebase.firestore.FirestoreError) => void
) => ListenerUnsubscribeFn;

export type FollowablePostCallbacks = {
  setPostFollowed?: SetPostFollowedFn;
  listenForUserPostFollow?: ListenForUserPostFollowFn;
};

export type FollowablePostViewState = {
  followCount: number;
  isFollowableByViewer: boolean;
  isFollowedByViewer?: boolean;
  setFollowed?: SetPostFollowedFn;
};
