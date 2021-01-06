import { Story, Meta } from "@storybook/react/types-6-0";
import React from "react";
import {
  EditableTypography,
  EditableTypographyProps,
} from "./EditableTypography";

export default {
  title: "Editing/EditableTypography",
  component: EditableTypography,
} as Meta;

const Template: Story<EditableTypographyProps> = (args) => (
  <EditableTypography {...args} />
);

export const EditableFilledInH1 = Template.bind({});
EditableFilledInH1.args = {
  readOnly: false,
  value: "Sample title",
  variant: "h1",
};

export const EditableBlankH2 = Template.bind({});
EditableBlankH2.args = {
  readOnly: false,
  variant: "h2",
};

export const ReadOnlyFilledInH3 = Template.bind({});
ReadOnlyFilledInH3.args = {
  readOnly: true,
  value: "Sample title (read-only)",
  variant: "h3",
};
