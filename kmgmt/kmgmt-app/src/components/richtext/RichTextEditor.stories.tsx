import { Story } from "@storybook/react/types-6-0";
import React, { FunctionComponent, useState } from "react";
import RichTextEditor, {
  RichTextEditorProps,
  Title,
  Body,
  EMPTY_RICH_TEXT_STATE,
} from "./RichTextEditor";

export default {
  title: "RichTextEditor",
  component: RichTextEditor,
};

const RichTextEditorStateWrapper: FunctionComponent<RichTextEditorProps> = (
  props
) => {
  const [title, setTitle] = useState(props.title);
  const [body, setBody] = useState<Body>(props.body);

  return (
    <RichTextEditor
      title={title}
      body={body}
      onTitleChange={setTitle}
      onBodyChange={setBody}
      enableToolbar={props.enableToolbar}
      readOnly={props.readOnly}
    />
  );
};

const Template: Story<RichTextEditorProps> = (args) => (
  <RichTextEditorStateWrapper {...args} />
);

// TODO: Define meaningful onTitleChange and onBodyChange handlers
export const BasicRTEReadOnly = Template.bind({});
BasicRTEReadOnly.args = {
  title: EMPTY_RICH_TEXT_STATE.title,
  body: EMPTY_RICH_TEXT_STATE.body,
  onTitleChange: (newTitle: Title) => {},
  onBodyChange: (newBody: Body) => {},
  enableToolbar: false,
  readOnly: true,
};
