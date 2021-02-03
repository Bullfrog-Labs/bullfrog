import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { AppAuthContext } from "../services/auth/AppAuth";
import { userToAppAuthState } from "../testing/AppAuthTestUtils";
import { PostSubtitleRow, PostSubtitleRowProps } from "./PostSubtitleRow";

const viewer = {
  uid: "123",
  displayName: "foo",
  username: "foo",
};

const viewerAppAuthContextDecorator = (Story: Story) => {
  return (
    <AppAuthContext.Provider value={userToAppAuthState(viewer)}>
      <Story />
    </AppAuthContext.Provider>
  );
};

export default {
  title: "PostView/PostSubtitleRow",
  component: PostSubtitleRow,
  decorators: [
    viewerAppAuthContextDecorator,
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} as Meta;

const Template: Story<PostSubtitleRowProps> = (args) => {
  return (
    <PostSubtitleRow
      {...args}
      deletePost={args.deletePost ?? (async () => {})}
    />
  );
};

export const AuthorIsViewer = Template.bind({});
AuthorIsViewer.args = {
  author: viewer,
};

export const AuthorIsNotViewer = Template.bind({});
AuthorIsNotViewer.args = {
  author: {
    uid: "456",
    displayName: "bar",
    username: "bar",
  },
};
