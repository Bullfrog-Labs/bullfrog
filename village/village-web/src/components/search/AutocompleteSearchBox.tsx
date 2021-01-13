import * as log from "loglevel";
import { CircularProgress, Dialog, Grid, makeStyles } from "@material-ui/core";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import Autosuggest, {
  ChangeEvent,
  OnSuggestionSelected,
  SuggestionsFetchRequested,
} from "react-autosuggest";
import { assertNever } from "../../utils";
import {
  CreateNewPostSuggestion,
  SearchSuggestion,
  SearchSuggestionFetchFn,
} from "../../services/search/Suggestions";
import { UserRecord } from "../../services/store/Users";
import { NavigateToPostSearchResult } from "./NavigateToPostSearchResult";
import { useHistory } from "react-router-dom";
import { postURL as makePostUrl } from "../../routing/URLs";
import { CreatePostFn } from "../../services/store/Posts";
import { CreateNewPostSearchResult } from "./CreateNewPostSearchResult";
import { AddBoxDimensions } from "@styled-icons/material/AddBox";
import axios from "axios";

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
  createPost: CreatePostFn;
  onClose: () => void;
  setShowProgress: Dispatch<SetStateAction<boolean>>;
};

const fetchTitleFromOpenGraph = async (url: string) => {
  const logger = log.getLogger("AutocompleteSearchBox");
  const encodedUri = encodeURIComponent(url);
  const rep = await axios.get(
    `https://opengraph.io/api/1.1/site/${encodedUri}?app_id=c4bf9937-cc07-45d0-b3ec-549bab92dc39`
  );
  if (rep.status === 200) {
    const data = rep.data;
    const title =
      data.openGraph.title || data.hybridGraph.title || data.htmlInferred.title;
    if (title) {
      return title;
    } else {
      logger.error(`Failed to fetch title; response=${rep}`);
    }
  } else {
    return "cant find title";
  }
};

const newCreateFromUrlItem = (title: string): CreateNewPostSuggestion => {
  return {
    title: title,
    action: "createNewPost",
  };
};

type SearchSuggestionState = {
  link: SearchSuggestion[];
  text: SearchSuggestion[];
};

const useAutocompleteState = (
  getSuggestions: any
): [SearchSuggestion[], (value: string) => void] => {
  const logger = log.getLogger("AutocompleteSearchBox");
  const [suggestions2, setSuggestions2] = useState<SearchSuggestionState>({
    link: [],
    text: [],
  });
  const suggestions = [...suggestions2.link, ...suggestions2.text];
  let suggestionsRequestStartTimeMs = Date.now();

  const startDatabaseRequest = async (value: string, startTimeMs: number) => {
    const suggestions = await getSuggestions(value);
    if (startTimeMs < suggestionsRequestStartTimeMs) {
      logger.debug(
        `Request has completed but the value has changed, ignoring result`
      );
    } else {
      logger.debug(
        `Request has completed, setting suggestions; count=${suggestions.length}`
      );
      setSuggestions2((prevState) => {
        return Object.assign({}, prevState, { text: suggestions });
      });
    }
  };

  const startOpenGraphRequest = async (value: string, startTimeMs: number) => {
    const title = await fetchTitleFromOpenGraph(value);

    if (startTimeMs < suggestionsRequestStartTimeMs) {
      logger.debug(`Got stale og request, aborting`);
    } else {
      logger.debug(`Og request complete, updating suggestions; title=${title}`);
      const suggestion: CreateNewPostSuggestion = {
        title: title,
        action: "createNewPost",
      };
      setSuggestions2((prevState) => {
        return Object.assign({}, prevState, { link: [suggestion] });
      });
    }
  };

  const startSuggestionsRequest = (value: string) => {
    suggestionsRequestStartTimeMs = Date.now();

    if (value === "") {
      return;
    }

    startDatabaseRequest(value, suggestionsRequestStartTimeMs);

    if (value.startsWith("http") || value.startsWith("https")) {
      startOpenGraphRequest(value, suggestionsRequestStartTimeMs);
    }
  };

  return [suggestions, startSuggestionsRequest];
};

export const AutocompleteSearchBox = (props: AutocompleteSearchBoxProps) => {
  const logger = log.getLogger("AutocompleteSearchBox");
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
  const [suggestions, startSuggestionsRequest] = useAutocompleteState(
    props.getSuggestions
  );

  const onChange: AutocompleteSearchBoxOnChangeFn = (event, changeEvent) => {
    setValue(changeEvent.newValue);
  };
  const onSuggestionsFetchRequested: SuggestionsFetchRequested = async (
    request
  ) => {
    const value = request.value;
    startSuggestionsRequest(value);
  };

  const onSuggestionsClearRequested = () => {
    startSuggestionsRequest("");
  };

  const getSuggestionValue = (suggestion: SearchSuggestion) => suggestion.title;
  const renderSuggestion = (suggestion: SearchSuggestion) => {
    switch (suggestion.action) {
      case "createNewPost":
        return <CreateNewPostSearchResult title={suggestion.title} />;
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

  const onSuggestionSelected: OnSuggestionSelected<SearchSuggestion> = async (
    event,
    data
  ) => {
    switch (data.suggestion.action) {
      case "createNewPost":
        props.setShowProgress(true);
        const createPostResult = await props.createPost(data.suggestion.title);
        const { postId } = createPostResult;

        switch (createPostResult.state) {
          case "success":
            const { postUrl } = createPostResult;
            logger.info(
              `new post created with title ${data.suggestion.title} and post id ${postId}, redirecting to ${postUrl}`
            );
            history.push(postUrl); // do redirect to permanent note url
            props.onClose();
            return;
          case "post-name-taken":
            logger.info(
              `new post creation with title ${data.suggestion.title} failed because that post name is already taken by post with id ${postId}, navigating to already-existing post`
            );
            history.push(makePostUrl(props.user.uid, createPostResult.postId));
            props.onClose();
            return;
          default:
            assertNever(createPostResult);
        }

        break;
      case "navigateToPost":
        history.push(
          makePostUrl(data.suggestion.authorId, data.suggestion.postId)
        );
        props.onClose();
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
    placeholder: "Type to search and create",
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
  createPost: CreatePostFn,
  getSuggestions: SearchSuggestionFetchFn
) => {
  const [open, setOpen] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const onClose = () => setOpen(false);

  const dialogComponent = showProgress ? (
    <Grid
      container
      spacing={0}
      direction={"column"}
      alignItems={"center"}
      justify={"center"}
      style={{ minHeight: "100px" }}
    >
      <Grid item>
        <CircularProgress />
      </Grid>
    </Grid>
  ) : (
    <AutocompleteSearchBox
      createPost={createPost}
      user={user}
      getSuggestions={getSuggestions}
      setShowProgress={setShowProgress}
      onClose={onClose}
    />
  );

  const dialog = (
    <Dialog
      maxWidth={"sm"}
      fullWidth={true}
      onClose={onClose}
      open={open}
      aria-labelledby="search-box-dialog-title"
      aria-describedby="search-box-dialog-description"
    >
      {dialogComponent}
    </Dialog>
  );

  return {
    dialogOpen: open,
    setDialogOpen: setOpen,
    dialog: dialog,
  };
};
