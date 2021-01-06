import { Meta, Story } from "@storybook/react/types-6-0";
import React, { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { EMPTY_RICH_TEXT } from "../components/richtext/Utils";
import { useMentions } from "../hooks/useMentions";
import {
  CreatePostResult,
  PostBody,
  PostId,
  UserPost,
  PostTitle,
  RenamePostFn,
  SyncBodyFn,
} from "../services/store/Posts";
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

  const getGlobalMentions = async (
    titlePrefix: string
  ): Promise<UserPost[]> => {
    return [];
  };
  const createPost = async (
    title: PostTitle,
    body: PostBody,
    postId?: PostId
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
    <MemoryRouter initialEntries={["/post/foo"]} initialIndex={0}>
      <PostView
        {...args}
        mentionables={mentionables}
        onMentionSearchChanged={onMentionSearchChanged}
        onMentionAdded={onMentionAdded}
      />
    </MemoryRouter>
  );
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
  viewer: {
    uid: "456",
    displayName: "baz",
    username: "baz",
  },
  author: {
    uid: "123",
    displayName: "qux",
    username: "qux",
  },
  getTitle: getTitleHardcoded,
  renamePost: renamePostAlwaysSuccessful,
  syncBody: syncBodyAlwaysSuccessful,
};
