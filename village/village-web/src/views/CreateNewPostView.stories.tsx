import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { useMentions } from "../hooks/useMentions";
import { postURL } from "../routing/URLs";
import { UserPost, CreatePostFn } from "../services/store/Posts";
import { CreateNewPostView, CreateNewPostViewProps } from "./PostView";

export default {
  title: "PostView/CreateNewPostView",
  component: CreateNewPostView,
} as Meta;

const Template: Story<CreateNewPostViewProps> = (args) => {
  const getGlobalMentions = async (): Promise<UserPost[]> => {
    return [];
  };
  const createPost: CreatePostFn = async () => {
    return { state: "success", postId: "hjkhj", postUrl: "" };
  };
  const authorId = "79832475341985234";
  const [mentionables, onMentionSearchChanged, onMentionAdded] = useMentions(
    getGlobalMentions,
    createPost,
    authorId,
    "l4stewar"
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
  createPost: async (newTitle) => ({
    state: "success",
    postId: "123",
    postUrl: postURL("456", newTitle),
  }),
  redirectAfterCreate: (postUrl) => {
    console.log(`Redirecting to post url ${postUrl}`);
  },
};

export const PrepopulatedTitle = Template.bind({});
PrepopulatedTitle.args = {
  prepopulatedTitle: "foo",
  createPost: async (newTitle) => ({
    state: "success",
    postId: "123",
    postUrl: postURL("456", newTitle),
  }),
  redirectAfterCreate: (postUrl) => {
    console.log(`Redirecting to post url ${postUrl}`);
  },
};
