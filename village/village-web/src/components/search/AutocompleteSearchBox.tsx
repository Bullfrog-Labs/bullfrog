import { Dialog, makeStyles } from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import Autosuggest, {
  ChangeEvent,
  OnSuggestionSelected,
  SuggestionsFetchRequested,
} from "react-autosuggest";
import { assertNever } from "../../utils";
import {
  SearchSuggestion,
  SearchSuggestionFetchFn,
} from "../../services/search/Suggestions";
import { UserRecord } from "../../services/store/Users";
import { NavigateToPostSearchResult } from "./NavigateToPostSearchResult";
import { useHistory } from "react-router-dom";

const AUTOCOMPLETE_SEARCH_BOX_KEY = "u";
const AUTOCOMPLETE_SEARCH_BOX_KEYMODIFIER = "command";
export const AUTOCOMPLETE_SEARCH_BOX_HOTKEY = `${AUTOCOMPLETE_SEARCH_BOX_KEYMODIFIER}+${AUTOCOMPLETE_SEARCH_BOX_KEY}`;
export const AUTOCOMPLETE_SEARCH_BOX_ESCKEY = "escape";

const isAutocompleteSearchBoxHotkey = (event: React.KeyboardEvent) => {
  if (AUTOCOMPLETE_SEARCH_BOX_KEYMODIFIER !== "command") {
    // needs to match with key-matching logic in this function. This is simpler
    // than setting up a lookup table.
    throw new Error(
      "Search box key modifier should be set to command, or logic needs to be updated"
    );
  }

  return event.metaKey && event.key === AUTOCOMPLETE_SEARCH_BOX_KEY;
};

type AutocompleteSearchBoxOnChangeFn = (
  event: React.FormEvent<any>,
  newValue: ChangeEvent
) => void;

export type AutocompleteSearchBoxProps = {
  user: UserRecord;
  getSuggestions: SearchSuggestionFetchFn;
  onClose: () => void;
};

export const AutocompleteSearchBox = (props: AutocompleteSearchBoxProps) => {
  const useStyles = makeStyles((theme) => ({
    input: {
      width: "100%",
      ...theme.typography.h5,
    },
    suggestionsContainer: {},
    container: {
      width: "100%",
      height: "100%",
      padding: theme.spacing(4),
    },
    suggestionsList: {
      listStyleType: "none",
      paddingLeft: theme.spacing(2),
    },
    suggestionHighlighted: {
      backgroundColor: theme.palette.action.selected,
    },
    suggestion: {
      ...theme.typography.h5,
    },
  }));

  const classes = useStyles();

  const [value, setValue] = useState<string>("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  const onChange: AutocompleteSearchBoxOnChangeFn = (event, changeEvent) => {
    setValue(changeEvent.newValue);
  };
  const onSuggestionsFetchRequested: SuggestionsFetchRequested = async (
    request
  ) => {
    const suggestions = await props.getSuggestions(request.value);
    setSuggestions(suggestions);
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion: SearchSuggestion) => suggestion.value;
  const renderSuggestion = (suggestion: SearchSuggestion) => {
    switch (suggestion.action) {
      case "createNewPost":
        return <div>create new post: {suggestion.value}</div>;
      case "navigateToPost":
        return (
          <NavigateToPostSearchResult
            user={props.user}
            suggestion={suggestion}
          />
        );
      default:
        assertNever(suggestion);
    }
  };

  const history = useHistory();

  const onSuggestionSelected: OnSuggestionSelected<SearchSuggestion> = (
    event,
    data
  ) => {
    switch (data.suggestion.action) {
      case "createNewPost":
        console.log("Creating a new post");
        break;
      case "navigateToPost":
        console.log("Navigating to post");
        history.push();
        break;
      default:
        assertNever(data.suggestion);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const inputProps = {
    onKeyDown: (event: React.KeyboardEvent) => {
      if (isAutocompleteSearchBoxHotkey(event)) {
        event.preventDefault();
        props.onClose();
      }
    },
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
      onSuggestionSelected={onSuggestionSelected}
      inputProps={inputProps}
      theme={{
        input: classes.input,
        container: classes.container,
        suggestionsContainer: classes.suggestionsContainer,
        suggestionsList: classes.suggestionsList,
        suggestionHighlighted: classes.suggestionHighlighted,
        suggestion: classes.suggestion,
      }}
    />
  );
};

export const useAutocompleteSearchBoxDialog = (
  user: UserRecord,
  getSuggestions: SearchSuggestionFetchFn
) => {
  const [open, setOpen] = useState(false);
  const onClose = () => setOpen(false);

  const dialog = (
    <Dialog
      maxWidth={"sm"}
      fullWidth={true}
      onClose={onClose}
      open={open}
      aria-labelledby="search-box-dialog-title"
      aria-describedby="search-box-dialog-description"
    >
      <AutocompleteSearchBox
        user={user}
        getSuggestions={getSuggestions}
        onClose={onClose}
      />
    </Dialog>
  );

  return {
    dialogOpen: open,
    setDialogOpen: setOpen,
    dialog: dialog,
  };
};
