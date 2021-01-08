import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { TypographyView, TypographyViewProps } from "./TypographyView";

export default {
  title: "Design/TypographyView",
  component: TypographyView,
} as Meta;

const Template: Story<TypographyViewProps> = (args) => (
  <TypographyView {...args} />
);

export const Default = Template.bind({});
Default.args = {};
