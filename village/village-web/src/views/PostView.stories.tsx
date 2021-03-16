import { Meta, Story } from "@storybook/react/types-6-0";
import React, { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { EMPTY_RICH_TEXT } from "../components/richtext/Utils";
import { AppAuthContext, CurriedByUser } from "../services/auth/AppAuth";
import {
  CreatePostFn,
  RenamePostFn,
  SyncBodyFn,
  UserPost,
} from "../services/store/Posts";
import { userToAppAuthState } from "../testing/AppAuthTestUtils";
import { EditablePostView, EditablePostViewProps } from "./PostView";

const viewer = {
  uid: "456",
  displayName: "baz",
  username: "baz",
};

const viewerAppAuthContextDecorator = (Story: Story) => {
  return (
    <AppAuthContext.Provider value={userToAppAuthState(viewer)}>
      <Story />
    </AppAuthContext.Provider>
  );
};

export default {
  title: "PostView/PostView",
  component: EditablePostView,
  decorators: [viewerAppAuthContextDecorator],
} as Meta;

const Template: Story<EditablePostViewProps> = (args) => {
  const [title, setTitle] = useState(args.title);
  args.title = title;
  args.setTitle = setTitle;

  const [body, setBody] = useState(args.body);
  args.body = body;
  args.setBody = setBody;

  const getGlobalMentions = async (): Promise<UserPost[]> => {
    return [
      {
        user: viewer,
        post: {
          id: "123",
          authorId: viewer.uid,
          body: EMPTY_RICH_TEXT,
          title: "foo",
          mentions: [],
          followCount: 0,
        },
      },
    ];
  };
  const createPost: CurriedByUser<CreatePostFn> = (user) => async (args) => {
    return { state: "success", postId: "hjkhj", postUrl: "" };
  };
  const renamePost: CurriedByUser<RenamePostFn> = (user) => async (
    postId,
    newTitle
  ) => ({ state: "success" });
  const syncBody: CurriedByUser<SyncBodyFn> = (user) => async (
    postId,
    newBody
  ) => "success";

  return (
    <MemoryRouter initialEntries={["/post/foo"]} initialIndex={0}>
      <EditablePostView
        {...args}
        editablePostCallbacks={{
          getGlobalMentions: getGlobalMentions,
          createPost: createPost,
          deletePost: async (userId, postId) => {},
          renamePost: renamePost,
          syncBody: syncBody,
        }}
      />
    </MemoryRouter>
  );
};

export const BasicPostView = Template.bind({});
BasicPostView.args = {
  postId: "456",
  title: "",
  body: EMPTY_RICH_TEXT,
  author: viewer,
  mentions: [],
};
