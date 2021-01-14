import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { ProfileView, ProfileViewProps } from "../components/ProfileView";
import { u0, posts0 } from "../testing/Fixtures";
import { MemoryRouter } from "react-router-dom";

export default {
  title: "Village/ProfileView",
  component: ProfileView,
} as Meta;

const Template: Story<ProfileViewProps> = (args) => (
  <MemoryRouter>
    <ProfileView {...args} />
  </MemoryRouter>
);

export const Default = Template.bind({});
Default.args = {
  posts: posts0,
  user: u0,
};
