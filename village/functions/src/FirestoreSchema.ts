import { PostId, UserId } from "./Types";

export const postPath = (args: { authorId: UserId; postId: PostId }) =>
  `/users/${args.authorId}/posts/${args.postId}`;

export const postFollowsCollPath = (args: { userId: UserId; postId: PostId }) =>
  `/users/${args.userId}/posts/${args.postId}/follows`;

export const followerPostFollowEntryPath = (args: {
  followerId: UserId;
  postId: PostId;
}) => `/users/${args.followerId}/follows/${args.postId}`;

export const getPostFollowEntryPaths = (args: {
  followerId: UserId;
  authorId: UserId;
  postId: PostId;
}) => ({
  followerPostFollowEntry: followerPostFollowEntryPath(args),
  postFollowEntry: `${postPath(args)}/follows/${args.followerId}`,
});
