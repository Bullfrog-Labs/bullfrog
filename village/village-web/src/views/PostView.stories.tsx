import { Meta, Story } from "@storybook/react/types-6-0";
import React, { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { EMPTY_RICH_TEXT } from "../components/richtext/Utils";
import { useMentions } from "../hooks/useMentions";
import { AppAuthContext, CurriedByUser } from "../services/auth/AppAuth";
import { AuthProvider } from "../services/auth/Auth";
import {
  UserPost,
  PostTitle,
  RenamePostFn,
  SyncBodyFn,
  CreatePostFn,
} from "../services/store/Posts";
import { UserRecord } from "../services/store/Users";
import { EditablePostView, EditablePostViewProps } from "./PostView";

const viewerAppAuthContextDecorator = (Story: Story) => {
  const viewer = {
    uid: "456",
    displayName: "baz",
    username: "baz",
  };

  const authProvider: AuthProvider = {
    onAuthStateChanged: (authState) => {},
    getInitialAuthProviderState: () => viewer,
  };

  const appAuthState = {
    authCompleted: true,
    authProviderState: authProvider.getInitialAuthProviderState(),
    authedUser: viewer,
  };

  return (
    <AppAuthContext.Provider value={appAuthState}>
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
    return [];
  };
  const createPost: CurriedByUser<CreatePostFn> = (user) => async (
    newTitle,
    postId
  ) => {
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
  author: {
    uid: "123",
    displayName: "qux",
    username: "qux",
  },
};
