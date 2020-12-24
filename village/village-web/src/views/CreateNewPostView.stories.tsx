import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";
import { CreateNewPostView, CreateNewPostViewProps } from "./PostView";

export default {
  title: "PostView/CreateNewPostView",
  component: CreateNewPostView,
} as Meta;

const Template: Story<CreateNewPostViewProps> = (args) => (
  <CreateNewPostView {...args} />
);

export const Untitled = Template.bind({});
Untitled.args = {
  createPost: async (newTitle, newBody) => ({
    state: "success",
    postId: "123",
    postUrl: `/posts/456/${newTitle}`,
  }),
  redirectAfterCreate: (postUrl) => {
    console.log(`Redirecting to post url ${postUrl}`);
  },
};

export const PrepopulatedTitle = Template.bind({});
PrepopulatedTitle.args = {
  prepopulatedTitle: "foo",
  createPost: async (newTitle, newBody) => ({
    state: "success",
    postId: "123",
    postUrl: `/posts/456/${newTitle}`,
  }),
  redirectAfterCreate: (postUrl) => {
    console.log(`Redirecting to post url ${postUrl}`);
  },
};
