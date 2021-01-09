import { Database } from "../store/Database";
import { getAllPostsByTitlePrefix } from "../store/Posts";

export type CreateNewPostSuggestion = {
  value: string;
  action: "createNewPost";
};

export type NavigateToPostSuggestion = {
  value: string;
  action: "navigateToPost";
};

export type SearchSuggestion =
  | CreateNewPostSuggestion
  | NavigateToPostSuggestion;

export type SearchSuggestionFetchFn = (value: string) => SearchSuggestion[];

export const getSearchSuggestionsByTitlePrefix: (
  database: Database
) => SearchSuggestionFetchFn = (database) => async (value: string) => {
  const allMatches = await getAllPostsByTitlePrefix(database)(value);
  return [];
};
