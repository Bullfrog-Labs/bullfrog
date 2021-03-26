import { Meta, Story } from "@storybook/react/types-6-0";
import { AuthedAppDrawer, AuthedAppDrawerProps } from "./AuthedAppDrawer";

export default {
  title: "Navigation/AuthedAppDrawer",
  component: AuthedAppDrawer,
} as Meta;

const Template: Story<AuthedAppDrawerProps> = (args) => {
  return <AuthedAppDrawer {...args} />;
};

export const Main = Template.bind({});
Main.args = {};
