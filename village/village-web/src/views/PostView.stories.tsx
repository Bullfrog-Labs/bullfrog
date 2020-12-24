import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";
import {
  EMPTY_RICH_TEXT_STATE,
  Title,
} from "../components/richtext/RichTextEditor";
import { RenamePostFn, SyncBodyFn } from "../services/store/Posts";
import { PostView, PostViewProps } from "./PostView";

export default {
  title: "PostView/PostView",
  component: PostView,
} as Meta;

const Template: Story<PostViewProps> = (args) => <PostView {...args} />;

const getTitleHardcoded: () => Promise<Title> = async () => {
  return "Original title";
};

const renamePostAlwaysSuccessful: RenamePostFn = async () => {
  return "success";
};

const syncBodyAlwaysSuccessful: SyncBodyFn = async () => {
  return "success";
};

export const BasicPostView = Template.bind({});
BasicPostView.args = {
  readOnly: false,
  postRecord: {
    id: "456",
    authorId: "123",
    title: EMPTY_RICH_TEXT_STATE.title,
    body: EMPTY_RICH_TEXT_STATE.body,
    updatedAt: new Date(),
  },
  getTitle: getTitleHardcoded,
  renamePost: renamePostAlwaysSuccessful,
  syncBody: syncBodyAlwaysSuccessful,
};
