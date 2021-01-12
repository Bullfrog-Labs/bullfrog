import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { forwardRef, useImperativeHandle } from "react";
import {
  SearchSuggestionFetchFn,
  SearchSuggestion,
  matchesToSearchSuggestions,
} from "../../services/search/Suggestions";
import { UserPost } from "../../services/store/Posts";
import { UserRecord } from "../../services/store/Users";
import {
  AutocompleteSearchBox,
  AUTOCOMPLETE_SEARCH_BOX_PROMPT,
  useAutocompleteSearchBoxDialog,
} from "./AutocompleteSearchBox";
import { getCreateNewPostPrompt } from "./CreateNewPostSearchResult";

const user0: UserRecord = {
  uid: "123",
  displayName: "Foo Bar",
  username: "foo",
};

test("renders AutocompleteSearchBox", () => {
  render(
    <AutocompleteSearchBox
      user={user0}
      onClose={jest.fn()}
      getSuggestions={jest.fn()}
      setShowProgress={jest.fn()}
      createPost={jest.fn()}
    />
  );
});

test("useAutocompleteSearchBoxDialog set up components correctly", async () => {
  const getSuggestions = jest.fn(async (value: string) => {
    console.log(value);
    const matches: UserPost[] = [];
    const suggestions = matchesToSearchSuggestions(matches, value);
    console.log(suggestions);
    return suggestions;
  });

  const createPost = jest.fn();

  const TestComponent = forwardRef((props, ref) => {
    const {
      dialogOpen,
      setDialogOpen,
      dialog,
    } = useAutocompleteSearchBoxDialog(user0, createPost, getSuggestions);

    useImperativeHandle(ref, () => ({
      setDialogOpen: (open: boolean) => setDialogOpen(open),
    }));

    return dialog;
  });

  const ref = {
    current: { setDialogOpen: jest.fn() },
  };

  const { container } = render(<TestComponent ref={ref} />);

  // Dialog not yet rendered.
  expect(container).toBeEmptyDOMElement();

  // Dialog should be rendered.
  act(() => ref.current.setDialogOpen(true));
  const inputEl = screen.getByPlaceholderText(AUTOCOMPLETE_SEARCH_BOX_PROMPT);
  expect(inputEl).toBeInTheDocument();

  // getsuggestions should be called
  const mockSearchBoxInput = "baz";
  // await act(() => userEvent.type(inputEl, mockSearchBoxInput));
  userEvent.type(inputEl, mockSearchBoxInput);
  waitFor(() => expect(inputEl).toHaveTextContent(mockSearchBoxInput));
  expect(getSuggestions).toHaveBeenCalled();

  // the option to create post should be present
  const createNewPostPromptText = getCreateNewPostPrompt(mockSearchBoxInput);
  const createNewPostSearchResultEl = screen.getByText(createNewPostPromptText);
  expect(createNewPostSearchResultEl).toBeInTheDocument();

  // Progress indicator should be rendered

  // Dialog should be rendered again
});
