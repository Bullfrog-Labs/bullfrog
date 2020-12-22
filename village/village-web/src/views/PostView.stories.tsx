import { Story } from "@storybook/react/types-6-0";
import React, { FunctionComponent, useState } from "react";
import {
  Body,
  EMPTY_RICH_TEXT_STATE,
  Title,
} from "../components/richtext/RichTextEditor";
import {
  PostView,
  PostViewProps,
  RenamePostResult,
  SyncBodyResult,
} from "./PostView";

export default {
  title: "PostView/PostView",
  component: PostView,
};

const PostViewStateWrapper = (props: PostViewProps) => {
  const [title, setTitle] = useState(props.postRecord.title);
  const [body, setBody] = useState(props.postRecord.body);

  const postRecord = {
    author: props.postRecord.author,
    title: title,
    body: body,
  };

  return (
    <PostView
      readOnly={props.readOnly}
      postRecord={postRecord}
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
    author: {
      uid: "123",
      displayName: "foo user",
    },
    title: EMPTY_RICH_TEXT_STATE.title,
    body: EMPTY_RICH_TEXT_STATE.body,
  },
  onTitleChange: (newTitle: Title) => {},
  onBodyChange: (newBody: Body) => {},
  renamePost: renamePostAlwaysSuccessful,
  syncBody: syncBodyAlwaysSuccessful,
};
