import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { useMentions } from "../hooks/useMentions";
import {
  PostRecord,
  CreatePostResult,
  PostTitle,
  PostBody,
  PostId,
} from "../services/store/Posts";
import { CreateNewPostView, CreateNewPostViewProps } from "./PostView";

export default {
  title: "PostView/CreateNewPostView",
  component: CreateNewPostView,
} as Meta;

const Template: Story<CreateNewPostViewProps> = (args) => {
  const getGlobalMentions = async (
    titlePrefix: string
  ): Promise<PostRecord[]> => {
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
    <MemoryRouter>
      <CreateNewPostView
        {...args}
        onMentionSearchChanged={onMentionSearchChanged}
        mentionables={mentionables}
        onMentionAdded={onMentionAdded}
      />
    </MemoryRouter>
  );
};

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
