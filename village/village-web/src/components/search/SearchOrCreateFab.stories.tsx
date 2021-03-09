import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";
import { SearchOrCreateFab, SearchOrCreateFabProps } from "./SearchOrCreateFab";

export default {
  title: "Search/SearchOrCreateFab",
  component: SearchOrCreateFab,
} as Meta;

const Template: Story<SearchOrCreateFabProps> = (args) => (
  <SearchOrCreateFab {...args} />
);

export const Base = Template.bind({});
Base.args = {};
