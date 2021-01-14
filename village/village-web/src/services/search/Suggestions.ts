import { Database } from "../store/Database";
import { getAllPostsByTitlePrefix, PostId, UserPost } from "../store/Posts";

import { UserId, UserRecord } from "../store/Users";

export type CreateNewPostSuggestion = {
  title: string;
  action: "createNewPost";
};

export type NavigateToPostSuggestion = {
  title: string;
  postId: PostId;
  authorId: UserId;
  authorUsername: string;
  action: "navigateToPost";
};

export type SearchSuggestion =
  | CreateNewPostSuggestion
  | NavigateToPostSuggestion;

export type SearchSuggestionFetchFn = (
  value: string
) => Promise<SearchSuggestion[]>;

export const matchesToSearchSuggestions = (
  matches: UserPost[],
  user: UserRecord,
  value: string
) => {
  const exactMatchExists =
    matches.filter((s) => s.post.title === value && s.user.uid === user.uid)
      .length !== 0;

  const createNewPostSuggestions: CreateNewPostSuggestion[] = exactMatchExists
    ? []
    : [{ action: "createNewPost", title: value }];

  const matchingSuggestions: NavigateToPostSuggestion[] = matches.map((s) => ({
    title: s.post.title,
    postId: s.post.id!,
    authorId: s.user.uid,
    authorUsername: s.user.username,
    action: "navigateToPost",
  }));

  return [...createNewPostSuggestions, ...matchingSuggestions];
};

export const getSearchSuggestionsByTitlePrefix: (
  database: Database,
  user: UserRecord
) => SearchSuggestionFetchFn = (database, user) => async (value) => {
  const allMatches = await getAllPostsByTitlePrefix(database)(value);

  return matchesToSearchSuggestions(allMatches, user, value);
};
