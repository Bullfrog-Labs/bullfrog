import { Meta, Story } from "@storybook/react/types-6-0";
import { MemoryRouter } from "react-router-dom";
import { PostSubtitleRow, PostSubtitleRowProps } from "./PostSubtitleRow";

export default {
  title: "PostView/PostSubtitleRow",
  component: PostSubtitleRow,
  decorators: [
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
  viewer: {
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
  viewer: {
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
