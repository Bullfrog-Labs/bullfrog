import React, { useState } from "react";
import Autosuggest from "react-autosuggest";

type SearchSuggestion = {};

type SuggestionFetchFn = (value: string) => SearchSuggestion[];
type AutocompleteSearchBoxOnChangeFn = (event: Event, newValue: string) => void;
type AutocompleteSearchBoxFetchRequestedFn = (value: String) => void;

export type AutocompleteSearchBoxProps = {
  getSuggestions: SuggestionFetchFn;
};

type AutocompleteSearchBoxInputProps = {
  value: string;
  onChange: AutocompleteSearchBoxOnChangeFn;
};

export const AutocompleteSearchBox = (props: AutocompleteSearchBoxProps) => {
  const [value, setValue] = useState<string>("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  const onChange: AutocompleteSearchBoxOnChangeFn = (event, newValue) => {
    setValue(newValue);
  };
  /*
  const onSuggestionsFetchRequested = async (value) => {
    const suggestions = await props.getSuggestions(value);
    setSuggestions(suggestions);
  };

  const onSuggestionsClearRequested = undefined;

  const inputProps = {
    value: value,
    onChange: onChange,
  };

  return <Autosuggest suggestions={suggestions} />;
  */

  return <></>;
};
