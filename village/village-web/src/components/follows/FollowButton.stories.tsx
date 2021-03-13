import { Meta, Story } from "@storybook/react/types-6-0";
import { FollowButton, FollowButtonProps } from "./FollowButton";

export default {
  title: "Follows/FollowButton",
  component: FollowButton,
} as Meta;

const Template: Story<FollowButtonProps> = (args) => <FollowButton {...args} />;

export const Main = Template.bind({});
Main.args = {
  isFollowed: false,
  tooltip: {
    followed: "Click to unfollow",
    notFollowed: "Click to follow",
  },
};
