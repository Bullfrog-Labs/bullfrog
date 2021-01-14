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
import { FetchTitleFromOpenGraphFn } from "../../services/OpenGraph";
import { CreateNewPostSearchResult } from "./CreateNewPostSearchResult";

const AUTOCOMPLETE_SEARCH_BOX_KEY = "u";
const AUTOCOMPLETE_SEARCH_BOX_KEYMODIFIER = "command";
export const AUTOCOMPLETE_SEARCH_BOX_HOTKEY = `${AUTOCOMPLETE_SEARCH_BOX_KEYMODIFIER}+${AUTOCOMPLETE_SEARCH_BOX_KEY}`;
export const AUTOCOMPLETE_SEARCH_BOX_ESCKEY = "escape";

export const AUTOCOMPLETE_SEARCH_BOX_PROMPT = "Type to search and create";

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
  fetchTitleFromOpenGraph: FetchTitleFromOpenGraphFn;
  createPost: CreatePostFn;
  onClose: () => void;
  setShowProgress: Dispatch<SetStateAction<boolean>>;
};

type SearchSuggestionState = {
  link: SearchSuggestion[];
  text: SearchSuggestion[];
};

export const useAutocompleteState = (
  getSuggestions: SearchSuggestionFetchFn,
  fetchTitleFromOpenGraph: FetchTitleFromOpenGraphFn
): [SearchSuggestion[], (value: string) => void] => {
  const logger = log.getLogger("AutocompleteSearchBox");
  const [suggestions, setSuggestions] = useState<SearchSuggestionState>({
    link: [],
    text: [],
  });
  const suggestionsList = [...suggestions.link, ...suggestions.text];
  const [value, setValue] = useState<string>();

  useEffect(() => {
    let isSubscribed = true;

    const startDatabaseRequest = async (value: string) => {
      logger.debug(`Issue db suggestions request`);
      try {
        const suggestions = await getSuggestions(value);
        if (!isSubscribed) {
          logger.debug(`Got stale db response, ignoring`);
        } else {
          logger.debug(
            `Request has completed, setting suggestions; count=${suggestions.length}`
          );
          setSuggestions((prevState) => {
            return Object.assign({}, prevState, { text: suggestions });
          });
        }
      } catch (e) {
        logger.debug(`Db request failed, not adding suggestions; error=${e}`);
      }
    };

    const startOpenGraphRequest = async (value: string) => {
      logger.debug(`Issue fetch title from og request`);
      const title = await fetchTitleFromOpenGraph(value);

      if (!isSubscribed) {
        logger.debug(`Got stale og response, ignoring`);
      } else if (title) {
        logger.debug(
          `Og request complete, updating suggestions; title=${title}`
        );
        const suggestion: CreateNewPostSuggestion = {
          title: title,
          action: "createNewPost",
        };
        setSuggestions((prevState) => {
          return Object.assign({}, prevState, { link: [suggestion] });
        });
      } else {
        logger.debug(`Og request failed, not adding suggestions`);
      }
    };

    const startRequests = (value: string) => {
      if (value === "") {
        return;
      }

      startDatabaseRequest(value);

      if (value.startsWith("http") || value.startsWith("https")) {
        startOpenGraphRequest(value);
      }
    };

    if (value) {
      startRequests(value);
    }

    return () => {
      isSubscribed = false;
    };
  }, [value, fetchTitleFromOpenGraph, getSuggestions, logger]);

  const startSuggestionsRequest = (newValue: string | undefined) => {
    setValue(newValue);
  };

  return [suggestionsList, startSuggestionsRequest];
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
    props.getSuggestions,
    props.fetchTitleFromOpenGraph
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
    placeholder: AUTOCOMPLETE_SEARCH_BOX_PROMPT,
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
  getSuggestions: SearchSuggestionFetchFn,
  fetchTitleFromOpenGraph: FetchTitleFromOpenGraphFn
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
      fetchTitleFromOpenGraph={fetchTitleFromOpenGraph}
    />
  );

  const dialog = (
    <Dialog
      maxWidth={"sm"}
      fullWidth={true}
      onClose={onClose}
      onExited={() => setShowProgress(false)}
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
