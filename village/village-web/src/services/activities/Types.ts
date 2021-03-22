import { PostId } from "../store/Posts";
import { UserId, UserRecord } from "../store/Users";

export type PostTarget = {
  type: "post";
  postId: PostId;
  authorId: UserId;
};
export type TargetType = PostTarget;

export type VerbFollow = {
  type: "follow";
};
export type VerbType = VerbFollow;

export type PostFollowContent = {
  title: string;
  follower: UserRecord;
};

export type ActivityContent = PostFollowContent;

export type ActivityId = string;

export type Activity = {
  actor: UserId;
  verb: VerbType;
  target: TargetType;
  content?: ActivityContent;
  createdAt: Date;
};
