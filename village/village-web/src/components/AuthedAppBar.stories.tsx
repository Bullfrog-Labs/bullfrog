import { Meta, Story } from "@storybook/react/types-6-0";
import { AuthedAppBar, AuthedAppBarProps } from "./AuthedAppBar";

export default {
  title: "AppBar/AuthedAppBar",
  component: AuthedAppBar,
} as Meta;

const Template: Story<AuthedAppBarProps> = (args) => {
  return <AuthedAppBar {...args} />;
};

export const Main = Template.bind({});
Main.args = {};
