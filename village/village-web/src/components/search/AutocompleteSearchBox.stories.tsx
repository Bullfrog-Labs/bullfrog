import { Story, Meta } from "@storybook/react/types-6-0";
import React from "react";
import {
  AutocompleteSearchBox,
  AutocompleteSearchBoxProps,
  getSuggestions,
} from "./AutocompleteSearchBox";

export default {
  title: "Search/AutocompleteSearchBox",
  component: AutocompleteSearchBox,
} as Meta;

const Template: Story<AutocompleteSearchBoxProps> = (args) => (
  <AutocompleteSearchBox {...args} />
);

export const InitialState = Template.bind({});
InitialState.args = { getSuggestions: getSuggestions };
