import { Dialog, makeStyles } from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
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

const useStyles = makeStyles(() => ({
  input: {
    width: "100%",
  },
  suggestionsContainer: {
    width: 400,
    height: 400,
  },
  suggestionsList: {
    listStyleType: "none",
  },
}));

export type AutocompleteSearchBoxProps = {
  getSuggestions: SuggestionFetchFn;
};

export const AutocompleteSearchBox = (props: AutocompleteSearchBoxProps) => {
  const classes = useStyles();

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

  const inputRef = useRef<HTMLInputElement>(null);
  const inputProps = {
    value: value,
    onChange: onChange,
    ref: inputRef,
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <Autosuggest
      suggestions={suggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      inputProps={inputProps}
      theme={{
        input: classes.input,
        suggestionsContainer: classes.suggestionsContainer,
        suggestionsList: classes.suggestionsList,
      }}
    />
  );
};

const allSuggestions: SearchSuggestion[] = [
  { action: "navigateToPost", value: "foo" },
  { action: "navigateToPost", value: "bar" },
  { action: "navigateToPost", value: "baz" },
];

export const getSuggestions: SuggestionFetchFn = (value) => {
  const exactMatchExists =
    allSuggestions.filter((s) => s.value === value).length !== 0;

  const createNewPostSuggestions: SearchSuggestion[] = exactMatchExists
    ? []
    : [{ action: "createNewPost", value: value }];

  const matchingSuggestions = allSuggestions.filter((s) =>
    s.value.startsWith(value)
  );

  return [...createNewPostSuggestions, ...matchingSuggestions];
};

export const useAutocompleteSearchBoxDialog = () => {
  const [open, setOpen] = useState(false);

  const dialog = (
    <Dialog
      maxWidth={"sm"}
      fullWidth={true}
      onClose={() => setOpen(false)}
      open={open}
      aria-labelledby="search-box-dialog-title"
      aria-describedby="search-box-dialog-description"
    >
      <AutocompleteSearchBox getSuggestions={getSuggestions} />
    </Dialog>
  );

  return {
    dialogOpen: open,
    setDialogOpen: setOpen,
    dialog: dialog,
  };
};
