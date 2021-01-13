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
});
