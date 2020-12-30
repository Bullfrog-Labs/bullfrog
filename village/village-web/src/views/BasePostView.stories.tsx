import { Meta, Story } from "@storybook/react/types-6-0";
import React, { useState } from "react";
import { EMPTY_RICH_TEXT } from "../components/richtext/Utils";
import { BasePostView, BasePostViewProps } from "./PostView";

export default {
  title: "PostView/BasePostView",
  component: BasePostView,
} as Meta;

const BasePostViewStateWrapper = (props: BasePostViewProps) => {
  const [title, setTitle] = useState(props.title);
  const [body, setBody] = useState(props.body);

  return (
    <BasePostView
      readOnly={props.readOnly}
      title={title}
      body={body}
      onTitleChange={setTitle}
      onBodyChange={setBody}
      onIdle={() => {}}
    />
  );
};

const Template: Story<BasePostViewProps> = (args) => (
  <BasePostViewStateWrapper {...args} />
);

export const BPV = Template.bind({});
BPV.args = {
  readOnly: false,
  title: "",
  body: EMPTY_RICH_TEXT,
  onTitleChange: () => {},
  onBodyChange: () => {},
  onIdle: () => {},
};
