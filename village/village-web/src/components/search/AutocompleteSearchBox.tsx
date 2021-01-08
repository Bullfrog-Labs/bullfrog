import { makeStyles, Modal } from "@material-ui/core";
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

const MODAL_TOP = "50%";
const MODAL_LEFT = "50%";

const MODAL_STYLE = {
  top: MODAL_TOP,
  left: MODAL_LEFT,
  transform: `translate(-${MODAL_TOP}, -${MODAL_LEFT})`,
};

const useStyles = makeStyles((theme) => ({
  modal: {
    position: "absolute",
    transform: `translate(-${MODAL_TOP} -${MODAL_LEFT}%)`,
    width: 400,
    height: 400,
    border: "2px solid #000",
    borderRadius: theme.spacing(1),
    // boxShadow: theme.shadows[5],
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2, 4, 3),
  },
  modalBackdrop: {
    backgroundColor: theme.palette.background.default,
  },
  input: {
    width: "100%",
  },
  suggestionsContainer: {
    width: "100%",
    height: "100%",
  },
}));

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

  const classes = useStyles();

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

export const useAutocompleteSearchBoxModal = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const classes = useStyles();

  const modal = (
    <Modal
      style={MODAL_STYLE}
      className={classes.modal}
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      aria-labelledby="search-box-modal-title"
      aria-describedby="search-box-modal-description"
      BackdropProps={{
        classes: { root: classes.modalBackdrop },
      }}
    >
      <div>
        <AutocompleteSearchBox getSuggestions={getSuggestions} />
      </div>
    </Modal>
  );

  return {
    modalOpen: modalOpen,
    setModalOpen: setModalOpen,
    modal: modal,
  };
};
