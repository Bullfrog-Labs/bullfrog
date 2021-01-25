import { Meta, Story } from "@storybook/react/types-6-0";
import { MemoryRouter } from "react-router-dom";
import { AppAuthContext } from "../services/auth/AppAuth";
import { AuthProvider } from "../services/auth/Auth";
import { PostSubtitleRow, PostSubtitleRowProps } from "./PostSubtitleRow";

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

const Template: Story<PostSubtitleRowProps> = (args) => (
  <PostSubtitleRow {...args} />
);

export const UserIsAuthor = Template.bind({});
UserIsAuthor.args = {
  author: {
    uid: "123",
    displayName: "foo",
    username: "foo",
  },
};

export const UserIsNotAuthor = Template.bind({});
UserIsNotAuthor.args = {
  author: {
    uid: "456",
    displayName: "bar",
    username: "bar",
  },
};
