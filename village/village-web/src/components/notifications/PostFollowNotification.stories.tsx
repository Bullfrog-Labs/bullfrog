import { Story, Meta } from "@storybook/react/types-6-0";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import {
  PostFollowNotification,
  PostFollowNotificationProps,
} from "./PostFollowNotification";

export default {
  title: "Notifications/PostFollowNotification",
  component: PostFollowNotification,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} as Meta;

const Template: Story<PostFollowNotificationProps> = (args) => (
  <PostFollowNotification {...args} />
);

export const Main = Template.bind({});
Main.args = {
  activity: {
    createdAt: new Date(),
    verb: { type: "follow" },
    target: { type: "post", postId: "abc", authorId: "123" },
    actor: "456",
    content: {
      title: "A followed post",
      follower: {
        uid: "456",
        username: "follower",
        displayName: "A follower",
      },
    },
  },
};
