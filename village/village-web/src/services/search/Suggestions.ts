import { Database } from "../store/Database";

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

export type SearchSuggestionFetchFn = (
  value: string
) => Promise<SearchSuggestion[]>;

export const getSearchSuggestionsByTitlePrefix: (
  database: Database
) => SearchSuggestionFetchFn = () => async () => {
  // const allMatches = await getAllPostsByTitlePrefix(database)(value);
  const foo: SearchSuggestion[] = [];
  return new Promise((resolve) => resolve(foo));
};
