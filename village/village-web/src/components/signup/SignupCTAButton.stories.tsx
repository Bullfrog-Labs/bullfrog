import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { SignupCTAButton, SignupCTAButtonProps } from "./SignupCTAButton";

export default {
  title: "Signup/SignupCTAButton",
  component: SignupCTAButton,
} as Meta;

const Template: Story<SignupCTAButtonProps> = (args) => (
  <SignupCTAButton {...args} />
);

export const Main = Template.bind({});
Main.args = {
  typeformPopupOpening: false,
};

export const TypeformPopupOpening = Template.bind({});
TypeformPopupOpening.args = {
  typeformPopupOpening: true,
};
