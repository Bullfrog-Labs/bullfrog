import * as admin from "firebase-admin";
import { PostId, UserId } from "./Types";

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

// Duplicate of UserRecord in village/village-web/src/services/store/Users.ts.
// Remove when able to share code between React and GCF.
export type UserRecord = {
  uid: UserId;
  displayName: string;
  username: string;
  description?: string;
};

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
};

export type TimestampedActivity = Activity & {
  // See https://firebase.google.com/docs/reference/admin/node/admin.firestore.FieldValue.
  // This is a sentinel value that is generated when the data is actually
  // written into Firestore servers.
  createdAt: admin.firestore.FieldValue;
};

export const postFollowActivity = (args: {
  followerId: UserId;
  authorId: UserId;
  postId: PostId;
  content: PostFollowContent;
}): Activity => {
  return {
    actor: args.followerId,
    verb: { type: "follow" },
    target: {
      type: "post",
      postId: args.postId,
      authorId: args.authorId,
    },
    content: args.content,
  };
};
