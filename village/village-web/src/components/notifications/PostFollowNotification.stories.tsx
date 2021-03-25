import { Meta, Story } from "@storybook/react/types-6-0";
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
        <div style={{ width: "632px" }}>
          <Story />
        </div>
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

export const Overflow = Template.bind({});
Overflow.args = {
  activity: {
    createdAt: new Date(),
    verb: { type: "follow" },
    target: { type: "post", postId: "abc", authorId: "123" },
    actor: "456",
    content: {
      title: "A followed post with a very long name",
      follower: {
        uid: "456",
        username: "followerwithaverylongusername",
        displayName: "A follower with a very long name",
      },
    },
  },
};
