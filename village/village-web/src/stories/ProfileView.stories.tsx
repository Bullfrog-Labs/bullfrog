import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { ProfileView, ProfileViewProps } from "../components/ProfileView";
import { u0, posts0 } from "../testing/Fixtures";

export default {
  title: "Village/ProfileView",
  component: ProfileView,
} as Meta;

const Template: Story<ProfileViewProps> = (args) => <ProfileView {...args} />;

export const Default = Template.bind({});
Default.args = {
  posts: posts0,
  user: u0,
};
