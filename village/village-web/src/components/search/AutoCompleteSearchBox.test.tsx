import React, { forwardRef, useImperativeHandle } from "react";
import { act as actHook, renderHook } from "@testing-library/react-hooks";
import * as log from "loglevel";
import { FetchTitleFromOpenGraphFn } from "../../services/OpenGraph";
import { Logging } from "kmgmt-common";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  matchesToSearchSuggestions,
  CreateNewPostSuggestion,
  SearchSuggestionFetchFn,
  NavigateToPostSuggestion,
  SearchSuggestion,
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
  useAutocompleteState,
  AUTOCOMPLETE_SEARCH_BOX_PROMPT,
  useAutocompleteSearchBoxDialog,
} from "./AutocompleteSearchBox";
import { getCreateNewPostPrompt } from "./CreateNewPostSearchResult";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";
import { postURL } from "../../routing/URLs";
import { EMPTY_RICH_TEXT } from "../richtext/Utils";

Logging.configure(log);

const user0: UserRecord = {
  uid: "123",
  displayName: "Foo Bar",
  username: "foo",
};

const ss1: NavigateToPostSuggestion = {
  title: "Title fool!",
  postId: "123",
  authorId: "123",
  authorUsername: "leighland",
  action: "navigateToPost",
};
const ss2: CreateNewPostSuggestion = {
  title: "Title mane",
  action: "createNewPost",
};
const getSuggestions: SearchSuggestionFetchFn = async (value: string) => {
  return [ss1];
};
const fetchTitleFromOpenGraph: FetchTitleFromOpenGraphFn = async (
  value: string
) => {
  return "Title mane";
};

test("renders AutocompleteSearchBox", () => {
  render(
    <AutocompleteSearchBox
      user={user0}
      onClose={jest.fn()}
      getSuggestions={jest.fn()}
      setShowProgress={jest.fn()}
      createPost={jest.fn()}
      fetchTitleFromOpenGraph={jest.fn()}
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
      getSuggestions,
      fetchTitleFromOpenGraph
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
    const suggestions = matchesToSearchSuggestions(matches, user0, value);
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
    const suggestions = matchesToSearchSuggestions(matches, user0, value);
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
    const suggestions = matchesToSearchSuggestions(matches, user0, value);
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

describe("useAutocompleteState hook", () => {
  const getSuggestionsFail: SearchSuggestionFetchFn = async (value: string) => {
    return Promise.reject(new Error("db request failed"));
  };
  const fetchTitleFromOpenGraphFail: FetchTitleFromOpenGraphFn = async (
    value: string
  ) => {
    return undefined;
  };

  test("renders db result only when not a url", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useAutocompleteState(getSuggestions, fetchTitleFromOpenGraph)
    );

    var [suggestions, startSuggestionsRequest] = result.current;

    await actHook(async () => {
      startSuggestionsRequest("wabisabi");
      await waitForNextUpdate();
    });

    var [suggestions] = result.current;

    expect(suggestions).toEqual([ss1]);
  });

  test("renders og and db results for a url", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useAutocompleteState(getSuggestions, fetchTitleFromOpenGraph)
    );

    var [suggestions, startSuggestionsRequest] = result.current;

    await actHook(async () => {
      startSuggestionsRequest("http://wabisabi.com");
      await waitForNextUpdate();
    });

    var [suggestions] = result.current;

    expect(suggestions).toEqual([ss2, ss1]);
  });

  test("renders db results when og fetch fails", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useAutocompleteState(getSuggestions, fetchTitleFromOpenGraphFail)
    );

    var [suggestions, startSuggestionsRequest] = result.current;

    await actHook(async () => {
      startSuggestionsRequest("http://wabisabi.com");
      await waitForNextUpdate();
    });

    var [suggestions] = result.current;

    expect(suggestions).toEqual([ss1]);
  });

  test("renders og results when db fetch fails", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useAutocompleteState(getSuggestionsFail, fetchTitleFromOpenGraph)
    );

    var [suggestions, startSuggestionsRequest] = result.current;

    await actHook(async () => {
      startSuggestionsRequest("http://wabisabi.com");
      await waitForNextUpdate();
    });

    var [suggestions] = result.current;

    expect(suggestions).toEqual([ss2]);
  });

  test("aborts stale requests", async () => {
    let resolveFetchFunctions: (value: unknown) => void | undefined;
    const p = new Promise((resolve, reject) => {
      resolveFetchFunctions = resolve;
    });

    /**
     * Set up the get suggestions function to be delayable.
     */
    const getSuggestionsResult = (value: string): SearchSuggestion[] => {
      return [
        {
          title: "Title fool! - " + value,
          postId: "123",
          authorId: "123",
          authorUsername: "leighland",
          action: "navigateToPost",
        },
      ];
    };
    function* getSuggestionsGenerator(): Generator<
      Promise<SearchSuggestion[]>
    > {
      yield p.then((_) => {
        return getSuggestionsResult("1");
      });
      yield Promise.resolve(getSuggestionsResult("2"));
    }
    const gsg = getSuggestionsGenerator();
    const getSuggestions: SearchSuggestionFetchFn = async (value: string) => {
      return gsg.next().value;
    };

    /**
     * Set up the fetch title function to be delayable.
     */
    function* fetchTitleFromOpenGraphGenerator(): Generator<
      Promise<string | undefined>
    > {
      yield p.then((_) => {
        return "1";
      });
      yield Promise.resolve("2");
    }
    const ftg = fetchTitleFromOpenGraphGenerator();
    const fetchTitleFromOpenGraph: FetchTitleFromOpenGraphFn = async (
      value: string
    ) => {
      return ftg.next().value;
    };

    /**
     * Run the test.
     */

    const { result, waitForNextUpdate } = renderHook(() =>
      useAutocompleteState(getSuggestions, fetchTitleFromOpenGraph)
    );

    var [suggestions, startSuggestionsRequest] = result.current;

    await actHook(async () => {
      startSuggestionsRequest("http://wabisabi.com");
    });

    await actHook(async () => {
      startSuggestionsRequest("http://wabisabi.co.uk");
      expect(resolveFetchFunctions).toBeDefined();
      await waitForNextUpdate();
    });

    var [suggestions] = result.current;

    const expSs1 = {
      action: "navigateToPost",
      authorId: "123",
      authorUsername: "leighland",
      postId: "123",
      title: "Title fool! - 2",
    };
    const expSs2 = {
      action: "createNewPost",
      title: "2",
    };
    expect(suggestions).toEqual([expSs2, expSs1]);

    await act(async () => {
      resolveFetchFunctions(null);
    });

    var [suggestions] = result.current;
    expect(suggestions).toEqual([expSs2, expSs1]);
  });
});
