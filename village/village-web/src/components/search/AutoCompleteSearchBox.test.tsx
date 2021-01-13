import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { forwardRef, useImperativeHandle } from "react";
import {
  matchesToSearchSuggestions,
  SearchSuggestionFetchFn,
} from "../../services/search/Suggestions";
import {
  CreatePostFn,
  CreatePostResultPostNameTaken,
  CreatePostResultSuccess,
  UserPost,
} from "../../services/store/Posts";
import { UserRecord } from "../../services/store/Users";
import {
  AutocompleteSearchBox,
  AUTOCOMPLETE_SEARCH_BOX_PROMPT,
  useAutocompleteSearchBoxDialog,
} from "./AutocompleteSearchBox";
import { getCreateNewPostPrompt } from "./CreateNewPostSearchResult";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";
import { postURL } from "../../routing/URLs";
import { EMPTY_RICH_TEXT } from "../richtext/Utils";

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

const createMockSearchBoxContainer = (
  getSuggestions: SearchSuggestionFetchFn,
  createPost: CreatePostFn
) => {
  const history = createMemoryHistory();

  const TestComponent = forwardRef((props, ref) => {
    const { setDialogOpen, dialog } = useAutocompleteSearchBoxDialog(
      user0,
      createPost,
      getSuggestions
    );

    useImperativeHandle(ref, () => ({
      setDialogOpen: (open: boolean) => setDialogOpen(open),
    }));

    return dialog;
  });

  const ref = {
    current: { setDialogOpen: jest.fn() },
  };

  const foo = (
    <Router history={history}>
      <TestComponent ref={ref} />
    </Router>
  );

  return { component: foo, ref: ref, history: history };
};

test("succesful post creation via search box", async () => {
  const mockSearchBoxInput = "baz";

  const getSuggestions = jest.fn(async (value: string) => {
    const matches: UserPost[] = [];
    const suggestions = matchesToSearchSuggestions(matches, value);
    return suggestions;
  });

  const mockNewPostId = "newpostid123";
  const mockNewPostUrl = "/mockurl123";

  const createPost = jest.fn(async () => {
    const result: CreatePostResultSuccess = {
      postId: mockNewPostId,
      postUrl: mockNewPostUrl,
      state: "success",
    };

    return result;
  });

  const testContainer = createMockSearchBoxContainer(
    getSuggestions,
    createPost
  );

  render(testContainer.component);

  // Dialog not yet rendered.

  // Dialog should be rendered.
  act(() => testContainer.ref.current.setDialogOpen(true));
  const inputEl = screen.getByPlaceholderText(AUTOCOMPLETE_SEARCH_BOX_PROMPT);
  expect(inputEl).toBeInTheDocument();

  // getsuggestions should be called
  userEvent.type(inputEl, mockSearchBoxInput);
  await waitFor(() => expect(inputEl).toHaveValue(mockSearchBoxInput));
  expect(getSuggestions).toHaveBeenCalled();

  // the option to create post should be present
  const createNewPostPromptText = getCreateNewPostPrompt(mockSearchBoxInput);
  const createNewPostSearchResultEl = screen.getByText(createNewPostPromptText);
  expect(createNewPostSearchResultEl).toBeInTheDocument();

  // create post should be called
  userEvent.click(createNewPostSearchResultEl);
  await waitFor(() => expect(createPost).toHaveBeenCalledTimes(1));

  // should be redirected to new note
  expect(testContainer.history.location.pathname).toEqual(mockNewPostUrl);
});

test("post creation of existing post via search box", async () => {
  const mockSearchBoxInput = "baz";

  const getSuggestions = jest.fn(async (value: string) => {
    const matches: UserPost[] = [];
    const suggestions = matchesToSearchSuggestions(matches, value);
    return suggestions;
  });

  const mockNewPostId = "newpostid123";

  const createPost = jest.fn(async () => {
    const result: CreatePostResultPostNameTaken = {
      postId: mockNewPostId,
      state: "post-name-taken",
    };

    return result;
  });

  const testContainer = createMockSearchBoxContainer(
    getSuggestions,
    createPost
  );

  render(testContainer.component);

  // Dialog not yet rendered.

  // Dialog should be rendered.
  act(() => testContainer.ref.current.setDialogOpen(true));
  const inputEl = screen.getByPlaceholderText(AUTOCOMPLETE_SEARCH_BOX_PROMPT);
  expect(inputEl).toBeInTheDocument();

  // getsuggestions should be called
  userEvent.type(inputEl, mockSearchBoxInput);
  await waitFor(() => expect(inputEl).toHaveValue(mockSearchBoxInput));
  expect(getSuggestions).toHaveBeenCalled();

  // the option to create post should be present
  const createNewPostPromptText = getCreateNewPostPrompt(mockSearchBoxInput);
  const createNewPostSearchResultEl = screen.getByText(createNewPostPromptText);
  expect(createNewPostSearchResultEl).toBeInTheDocument();

  // create post should be called
  userEvent.click(createNewPostSearchResultEl);
  await waitFor(() => expect(createPost).toHaveBeenCalledTimes(1));

  // should be redirected to existing note
  expect(testContainer.history.location.pathname).toEqual(
    postURL(user0.uid, mockNewPostId)
  );
});

test("navigate to existing post via search box", async () => {
  const mockSearchBoxInput = "baz";
  const mockPostId = "mockPost123";

  const getSuggestions = jest.fn(async (value: string) => {
    const matches: UserPost[] = [
      {
        user: user0,
        post: {
          id: mockPostId,
          authorId: user0.uid,
          title: mockSearchBoxInput,
          body: EMPTY_RICH_TEXT,
          mentions: [],
        },
      },
    ];
    const suggestions = matchesToSearchSuggestions(matches, value);
    return suggestions;
  });

  const createPost = jest.fn(async () => {
    throw new Error("Unexpected call to mock createPost");
  });

  const testContainer = createMockSearchBoxContainer(
    getSuggestions,
    createPost
  );

  render(testContainer.component);

  // Dialog not yet rendered.

  // Dialog should be rendered.
  act(() => testContainer.ref.current.setDialogOpen(true));
  const inputEl = screen.getByPlaceholderText(AUTOCOMPLETE_SEARCH_BOX_PROMPT);
  expect(inputEl).toBeInTheDocument();

  // getsuggestions should be called
  userEvent.type(inputEl, mockSearchBoxInput);
  await waitFor(() => expect(inputEl).toHaveValue(mockSearchBoxInput));
  expect(getSuggestions).toHaveBeenCalled();

  // the option to create post should be present
  const navigateToPostSearchResultEl = screen.getByText(mockSearchBoxInput);
  expect(navigateToPostSearchResultEl).toBeInTheDocument();

  // create post should be called
  userEvent.click(navigateToPostSearchResultEl);

  // should be redirected to existing note
  expect(testContainer.history.location.pathname).toEqual(
    postURL(user0.uid, mockPostId)
  );

  // Dialog should be closed
});
