import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { PostStackLink, PostStackLinkProps } from "./PostStackLink";

export default {
  title: "Stacks/PostStackLink",
  component: PostStackLink,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} as Meta;

const Template: Story<PostStackLinkProps> = (args) => (
  <PostStackLink {...args} />
);

export const BasicPostStackLink = Template.bind({});
BasicPostStackLink.args = {
  postTitle: "Basic stack",
};
