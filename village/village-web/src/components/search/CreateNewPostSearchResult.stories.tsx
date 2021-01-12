import React from "react";
import { Meta, Story } from "@storybook/react/types-6-0";
import {
  CreateNewPostSearchResult,
  CreateNewPostSearchResultProps,
} from "./CreateNewPostSearchResult";
import { MemoryRouter } from "react-router-dom";

export default {
  title: "Search/CreateNewPostSearchResult",
  component: CreateNewPostSearchResult,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} as Meta;

const Template: Story<CreateNewPostSearchResultProps> = (args) => (
  <CreateNewPostSearchResult {...args} />
);

export const CreateNewPost = Template.bind({});
CreateNewPost.args = {
  title: "New post",
};
