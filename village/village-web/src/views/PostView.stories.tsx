import { Meta, Story } from "@storybook/react/types-6-0";
import React, { useState } from "react";
import {
  Body,
  EMPTY_RICH_TEXT_STATE,
  Title,
} from "../components/richtext/RichTextEditor";
import { PostID } from "../services/store/Posts";
import {
  PostView,
  PostViewProps,
  RenamePostResult,
  SyncBodyResult,
} from "./PostView";

export default {
  title: "PostView/PostView",
  component: PostView,
} as Meta;

const PostViewStateWrapper = (props: PostViewProps) => {
  const [title, setTitle] = useState(props.postRecord.title);
  const [body, setBody] = useState(props.postRecord.body);

  const postRecord = {
    id: props.postRecord.id,
    authorId: props.postRecord.authorId,
    title: title,
    body: body,
    updatedAt: new Date(),
  };

  return (
    <PostView
      readOnly={props.readOnly}
      postRecord={postRecord}
      getTitle={props.getTitle}
      onTitleChange={setTitle}
      onBodyChange={setBody}
      renamePost={props.renamePost}
      syncBody={props.syncBody}
    />
  );
};

const Template: Story<PostViewProps> = (args) => (
  <PostViewStateWrapper {...args} />
);

const getTitleHardcoded: (postId: PostID) => Promise<Title> = async (
  postId
) => {
  return "Original title";
};

const renamePostAlwaysSuccessful: (
  newTitle: Title
) => Promise<RenamePostResult> = async (newTitle) => {
  return "success";
};

const syncBodyAlwaysSuccessful: (
  newBody: Body
) => Promise<SyncBodyResult> = async (newBody) => {
  return "success";
};

export const BasicPostView = Template.bind({});
BasicPostView.args = {
  postRecord: {
    id: "456",
    authorId: "123",
    title: EMPTY_RICH_TEXT_STATE.title,
    body: EMPTY_RICH_TEXT_STATE.body,
    updatedAt: new Date(),
  },
  onTitleChange: (newTitle: Title) => {},
  onBodyChange: (newBody: Body) => {},
  getTitle: getTitleHardcoded,
  renamePost: renamePostAlwaysSuccessful,
  syncBody: syncBodyAlwaysSuccessful,
};
