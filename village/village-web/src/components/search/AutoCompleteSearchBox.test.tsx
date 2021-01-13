import React from "react";
import { render, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import * as log from "loglevel";
import { FetchTitleFromOpenGraphFn } from "../../services/OpenGraph";
import { UserRecord } from "../../services/store/Users";
import {
  AutocompleteSearchBox,
  useAutocompleteState,
} from "./AutocompleteSearchBox";
import {
  CreateNewPostSuggestion,
  SearchSuggestionFetchFn,
  NavigateToPostSuggestion,
  SearchSuggestion,
} from "../../services/search/Suggestions";
import { Logging } from "kmgmt-common";

Logging.configure(log);

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
      fetchTitleFromOpenGraph={jest.fn()}
    />
  );
});

describe("useAutocompleteState hook", () => {
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
  const getSuggestionsFail: SearchSuggestionFetchFn = async (value: string) => {
    //throw new Error("db request failed");
    return Promise.reject(new Error("db request failed"));
  };
  const fetchTitleFromOpenGraph: FetchTitleFromOpenGraphFn = async (
    value: string
  ) => {
    return "Title mane";
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

    await act(async () => {
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

    await act(async () => {
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

    await act(async () => {
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

    await act(async () => {
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

    await act(async () => {
      startSuggestionsRequest("http://wabisabi.com");
    });

    await act(async () => {
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
