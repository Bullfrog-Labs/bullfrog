import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { StackView, StackViewProps } from "../components/StackView";
import { userPosts0 } from "../testing/Fixtures";
import { MemoryRouter } from "react-router-dom";

export default {
  title: "Stacks/StackView",
  component: StackView,
} as Meta;

const Template: Story<StackViewProps> = (args) => {
  return (
    <MemoryRouter>
      <StackView {...args} />
    </MemoryRouter>
  );
};

export const Default = Template.bind({});
Default.args = {
  posts: userPosts0,
  source: { name: "Foo to the bar" },
};
