import { Meta, Story } from "@storybook/react/types-6-0";
import React, { useState } from "react";
import { EMPTY_RICH_TEXT } from "../components/richtext/Utils";
import { PostTitle, RenamePostFn, SyncBodyFn } from "../services/store/Posts";
import { PostView, PostViewProps } from "./PostView";

export default {
  title: "PostView/PostView",
  component: PostView,
} as Meta;

const Template: Story<PostViewProps> = (args) => {
  const [title, setTitle] = useState(args.title);
  args.title = title;
  args.setTitle = setTitle;

  const [body, setBody] = useState(args.body);
  args.body = body;
  args.setBody = setBody;

  return <PostView {...args} />;
};

const getTitleHardcoded: () => Promise<PostTitle> = async () => {
  return "Original title";
};

const renamePostAlwaysSuccessful: RenamePostFn = async (postId, newTitle) => {
  return { state: "success" };
};

const syncBodyAlwaysSuccessful: SyncBodyFn = async () => {
  return "success";
};

export const BasicPostView = Template.bind({});
BasicPostView.args = {
  readOnly: false,
  postId: "456",
  title: "",
  body: EMPTY_RICH_TEXT,
  getTitle: getTitleHardcoded,
  renamePost: renamePostAlwaysSuccessful,
  syncBody: syncBodyAlwaysSuccessful,
};
