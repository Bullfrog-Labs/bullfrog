import { Story, Meta } from "@storybook/react/types-6-0";
import React from "react";
import {
  AutocompleteSearchBox,
  AutocompleteSearchBoxProps,
  SearchSuggestion,
  SuggestionFetchFn,
} from "./AutocompleteSearchBox";

export default {
  title: "Search/AutocompleteSearchBox",
  component: AutocompleteSearchBox,
} as Meta;

const Template: Story<AutocompleteSearchBoxProps> = (args) => (
  <AutocompleteSearchBox {...args} />
);

const allSuggestions: SearchSuggestion[] = [
  { action: "navigateToPost", value: "foo" },
  { action: "navigateToPost", value: "bar" },
  { action: "navigateToPost", value: "baz" },
];

const getSuggestions: SuggestionFetchFn = (value) => {
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

export const InitialState = Template.bind({});
InitialState.args = { getSuggestions: getSuggestions };
