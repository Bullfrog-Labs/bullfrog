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
    value: "foo",
  },
  {
    action: "navigateToPost",
    authorId: "456",
    authorUsername: "user456",
    value: "foo",
  },
  {
    action: "navigateToPost",
    authorId: "456",
    authorUsername: "user456",
    value: "bar",
  },
  {
    action: "navigateToPost",
    authorId: "456",
    authorUsername: "user456",
    value: "baz",
  },
];

export const getSuggestions: SearchSuggestionFetchFn = async (value) => {
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

export default {
  title: "Search/AutocompleteSearchBox",
  component: AutocompleteSearchBox,
} as Meta;

const Template: Story<AutocompleteSearchBoxProps> = (args) => (
  <AutocompleteSearchBox {...args} />
);

export const InitialState = Template.bind({});
InitialState.args = { getSuggestions: getSuggestions };
