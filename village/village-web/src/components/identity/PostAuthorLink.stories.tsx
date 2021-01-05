import { Meta, Story } from "@storybook/react/types-6-0";
import { MemoryRouter } from "react-router-dom";
import { PostAuthorLink, PostAuthorLinkProps } from "./PostAuthorLink";

export default {
  title: "Identity/PostAuthorLink",
  component: PostAuthorLink,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} as Meta;

const Template: Story<PostAuthorLinkProps> = (args) => (
  <PostAuthorLink {...args} />
);

export const UserIsAuthor = Template.bind({});
UserIsAuthor.args = {
  user: {
    uid: "123",
    displayName: "foo",
    username: "foo",
  },
  author: {
    uid: "123",
    displayName: "foo",
    username: "foo",
  },
};

export const UserIsNotAuthor = Template.bind({});
UserIsNotAuthor.args = {
  user: {
    uid: "123",
    displayName: "foo",
    username: "foo",
  },
  author: {
    uid: "456",
    displayName: "bar",
    username: "bar",
  },
};
