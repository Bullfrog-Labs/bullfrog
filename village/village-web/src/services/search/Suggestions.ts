import { Database } from "../store/Database";
import { getAllPostsByTitlePrefix, PostId } from "../store/Posts";

import { UserId } from "../store/Users";

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

export const getSearchSuggestionsByTitlePrefix: (
  database: Database
) => SearchSuggestionFetchFn = (database) => async (value) => {
  const allMatches = await getAllPostsByTitlePrefix(database)(value);

  const exactMatchExists =
    allMatches.filter((s) => s.post.title === value).length !== 0;

  const createNewPostSuggestions: CreateNewPostSuggestion[] = exactMatchExists
    ? []
    : [{ action: "createNewPost", title: value }];

  const matchingSuggestions: NavigateToPostSuggestion[] = allMatches.map(
    (s) => ({
      title: s.post.title,
      postId: s.post.id!,
      authorId: s.user.uid,
      authorUsername: s.user.username,
      action: "navigateToPost",
    })
  );

  return [...createNewPostSuggestions, ...matchingSuggestions];
};
