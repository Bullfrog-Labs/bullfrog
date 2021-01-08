import React, { useState } from "react";
import Autosuggest, {
  ChangeEvent,
  SuggestionsFetchRequested,
} from "react-autosuggest";
import { assertNever } from "../../utils";

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

export type SuggestionFetchFn = (value: string) => SearchSuggestion[];
type AutocompleteSearchBoxOnChangeFn = (
  event: React.FormEvent<any>,
  newValue: ChangeEvent
) => void;

export type AutocompleteSearchBoxProps = {
  getSuggestions: SuggestionFetchFn;
};

export const AutocompleteSearchBox = (props: AutocompleteSearchBoxProps) => {
  const [value, setValue] = useState<string>("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  const onChange: AutocompleteSearchBoxOnChangeFn = (event, changeEvent) => {
    setValue(changeEvent.newValue);
  };
  const onSuggestionsFetchRequested: SuggestionsFetchRequested = (request) => {
    const suggestions = props.getSuggestions(request.value);
    setSuggestions(suggestions);
  };

  const onSuggestionsClearRequested = undefined;

  const getSuggestionValue = (suggestion: SearchSuggestion) => suggestion.value;
  const renderSuggestion = (suggestion: SearchSuggestion) => {
    switch (suggestion.action) {
      case "createNewPost":
        return <div>create new post: {suggestion.value}</div>;
      case "navigateToPost":
        return <div>{suggestion.value}</div>;
      default:
        assertNever(suggestion);
    }
  };

  const inputProps = {
    value: value,
    onChange: onChange,
  };

  return (
    <Autosuggest
      suggestions={suggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      inputProps={inputProps}
    />
  );
};
