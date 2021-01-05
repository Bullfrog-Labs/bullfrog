import { Meta, Story } from "@storybook/react/types-6-0";
import React, { useState } from "react";
import { EMPTY_RICH_TEXT } from "../components/richtext/Utils";
import { Body } from "../components/richtext/RichTextEditor";
import { BasePostView, BasePostViewProps } from "./PostView";
import { UserPost, CreatePostResult } from "../services/store/Posts";
import { useMentions } from "../hooks/useMentions";

export default {
  title: "PostView/BasePostView",
  component: BasePostView,
} as Meta;

const BasePostViewStateWrapper = (props: BasePostViewProps) => {
  const [title, setTitle] = useState(props.title);
  const [body, setBody] = useState(props.body);

  const getGlobalMentions = async (
    titlePrefix: string
  ): Promise<UserPost[]> => {
    return [];
  };
  const createPost = async (
    title: string,
    body: Body,
    postId?: string
  ): Promise<CreatePostResult> => {
    return { state: "success", postId: "hjkhj", postUrl: "" };
  };
  const authorId = "79832475341985234";
  const [mentionables, onMentionSearchChanged, onMentionAdded] = useMentions(
    getGlobalMentions,
    createPost,
    authorId
  );

  return (
    <BasePostView
      readOnly={props.readOnly}
      title={title}
      body={body}
      onTitleChange={setTitle}
      onBodyChange={setBody}
      onIdle={() => {}}
      onMentionSearchChanged={onMentionSearchChanged}
      mentionables={mentionables}
      onMentionAdded={onMentionAdded}
      mentionableElementFn={(option) => (
        <React.Fragment>option.value</React.Fragment>
      )}
    />
  );
};

const Template: Story<BasePostViewProps> = (args) => (
  <BasePostViewStateWrapper {...args} />
);

export const BPV = Template.bind({});
BPV.args = {
  readOnly: false,
  title: "",
  body: EMPTY_RICH_TEXT,
  onTitleChange: () => {},
  onBodyChange: () => {},
  onIdle: () => {},
};
