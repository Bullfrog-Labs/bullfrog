import { Story, Meta } from "@storybook/react/types-6-0";
import React from "react";
import {
  SearchSuggestion,
  SearchSuggestionFetchFn,
} from "../../services/search/Suggestions";
import {
  AutocompleteSearchBox,
  AutocompleteSearchBoxProps,
} from "./AutocompleteSearchBox";

const allSuggestions: SearchSuggestion[] = [
  {
    action: "navigateToPost",
    authorId: "123",
    authorUsername: "user123",
    title: "foo",
    postId: "jkdljksada",
  },
  {
    action: "navigateToPost",
    authorId: "456",
    authorUsername: "user456",
    title: "foo",
    postId: "jlkoqipewq",
  },
  {
    action: "navigateToPost",
    authorId: "456",
    authorUsername: "user456",
    title: "bar",
    postId: "qweqpoewqi",
  },
  {
    action: "navigateToPost",
    authorId: "456",
    authorUsername: "user456",
    title: "baz",
    postId: "zxcxznmmxz",
  },
];

export const getSuggestions: SearchSuggestionFetchFn = async (value) => {
  const exactMatchExists =
    allSuggestions.filter((s) => s.title === value).length !== 0;

  const createNewPostSuggestions: SearchSuggestion[] = exactMatchExists
    ? []
    : [{ action: "createNewPost", title: value }];

  const matchingSuggestions = allSuggestions.filter((s) =>
    s.title.startsWith(value)
  );

  return [...createNewPostSuggestions, ...matchingSuggestions];
};

export default {
  title: "Search/AutocompleteSearchBox",
  component: AutocompleteSearchBox,
} as Meta;

const Template: Story<AutocompleteSearchBoxProps> = (args) => (
  <AutocompleteSearchBox {...args} />
);

export const InitialState = Template.bind({});
InitialState.args = { getSuggestions: getSuggestions };
