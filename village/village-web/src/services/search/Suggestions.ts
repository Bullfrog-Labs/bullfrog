import { Database } from "../store/Database";
import { getAllPostsByTitlePrefix } from "../store/Posts";

import { UserId } from "../store/Users";

export type CreateNewPostSuggestion = {
  value: string;
  action: "createNewPost";
};

export type NavigateToPostSuggestion = {
  value: string;
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

export const getSearchSuggestionsByTitlePrefix: (
  database: Database
) => SearchSuggestionFetchFn = (database) => async (value) => {
  const allMatches = await getAllPostsByTitlePrefix(database)(value);

  const exactMatchExists =
    allMatches.filter((s) => s.post.title === value).length !== 0;

  const createNewPostSuggestions: CreateNewPostSuggestion[] = exactMatchExists
    ? []
    : [{ action: "createNewPost", value: value }];

  // TODO: Need to add author here
  const matchingSuggestions: NavigateToPostSuggestion[] = allMatches.map(
    (s) => ({
      value: s.post.title,
      authorId: s.user.uid,
      authorUsername: s.user.username,
      action: "navigateToPost",
    })
  );

  return [...createNewPostSuggestions, ...matchingSuggestions];
};
