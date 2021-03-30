import { Story, Meta } from "@storybook/react/types-6-0";
import { useState } from "react";
import { SaveIndicator, SaveIndicatorProps } from "./SaveIndicator";

export default {
  title: "Editor/SaveIndicator",
  component: SaveIndicator,
} as Meta;

const Template: Story<SaveIndicatorProps> = (args) => {
  const [open, setOpen] = useState(args.open);
  return <SaveIndicator open={open} setOpen={setOpen} state={args.state} />;
};

export const AllChangesSaved = Template.bind({});
AllChangesSaved.args = {
  state: "all-changes-saved",
};

export const ChangesUnsaved = Template.bind({});
ChangesUnsaved.args = {
  state: "changes-unsaved",
};

export const SavingChanges = Template.bind({});
SavingChanges.args = {
  state: "saving-changes",
};
