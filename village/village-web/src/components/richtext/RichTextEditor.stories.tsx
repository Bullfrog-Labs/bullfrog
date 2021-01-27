import { Meta, Story } from "@storybook/react/types-6-0";
import React, { FunctionComponent, useState } from "react";
import { MemoryRouter } from "react-router-dom";
import RichTextEditor, { RichTextEditorProps, Body } from "./RichTextEditor";
import { EMPTY_RICH_TEXT } from "./Utils";
import { MentionNodeData } from "@blfrg.xyz/slate-plugins";
import delay from "delay";

export default {
  title: "Editing/RichTextEditor",
  component: RichTextEditor,
} as Meta;

const RichTextEditorStateWrapper: FunctionComponent<RichTextEditorProps> = (
  props
) => {
  const [body, setBody] = useState<Body>(props.body);
  const [mentionables, setMentionables] = useState<MentionNodeData[]>([]);
  const [search, setSearch] = useState<string>();

  const MENTIONABLES = [
    { value: "Aayla Secura" },
    { value: "Adi Gallia" },
    { value: "Admiral Dodd Rancit" },
    { value: "Admiral Firmus Piett" },
  ];

  const onMentionSearchChanged = (newSearch: string) => {
    const updateMentionables = async () => {
      if (search !== newSearch) {
        await delay(500);
        const newMentionables = Array.from(MENTIONABLES);
        const newMention: MentionNodeData = { value: newSearch, exists: false };
        if (newSearch) {
          newMentionables.splice(0, 0, newMention);
        }
        setMentionables(newMentionables);
        setSearch(newSearch);
      }
    };
    updateMentionables();
  };

  return (
    <MemoryRouter>
      <RichTextEditor
        body={body}
        onChange={setBody}
        enableToolbar={props.enableToolbar}
        readOnly={props.readOnly}
        mentionTypeaheadComponents={{
          mentionables: mentionables,
          onMentionSearchChanged: onMentionSearchChanged,
          onMentionAdded: (mention: MentionNodeData) => {},
        }}
      />
    </MemoryRouter>
  );
};

const Template: Story<RichTextEditorProps> = (args) => (
  <RichTextEditorStateWrapper {...args} />
);

export const BasicRTEReadOnly = Template.bind({});
BasicRTEReadOnly.args = {
  body: EMPTY_RICH_TEXT,
  onChange: (newBody: Body) => {}, // this does not get used
  enableToolbar: false,
  readOnly: true,
};

export const BasicRTE = Template.bind({});
BasicRTE.args = {
  body: EMPTY_RICH_TEXT,
  onChange: (newBody: Body) => {},
  enableToolbar: false,
  readOnly: false,
};
export const RTEWithToolbar = Template.bind({});
RTEWithToolbar.args = {
  body: EMPTY_RICH_TEXT,
  onChange: (newBody: Body) => {},
  enableToolbar: true,
  readOnly: false,
};

const TEST_STATE = {
  title: "Nulla facilisi",
  body: [
    { type: "heading-1", children: [{ text: "Lacus sed viverra tellus in" }] },
    {
      type: "paragraph",
      children: [
        {
          text:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        },
      ],
    },
    {
      type: "heading-2",
      children: [{ text: "Scelerisque viverra mauris in aliquam" }],
    },
    {
      type: "paragraph",
      children: [
        { text: "Nisl nisi scelerisque eu ultrices vitae ", bold: true },
        { text: "auctor. Habitasse", bold: true, italic: true },
        { text: " platea", italic: true },
        {
          text:
            " dictumst quisque sagittis purus sit amet volutpat consequat. Vitae sapien pellentesque habitant morbi tristique senectus et netus. Lobortis scelerisque fermentum dui faucibus. dadsadsa",
        },
      ],
    },
    {
      type: "heading-3",
      children: [{ text: "non curabitur gravida arcu ac" }],
    },
    {
      type: "bulleted-list",
      children: [
        {
          type: "list-item",
          children: [{ text: "dictum fusce ut placerat orci" }],
        },
        {
          type: "list-item",
          children: [{ text: "mus mauris vitae ultricies leo" }],
        },
        {
          type: "list-item",
          children: [{ text: "urna molestie at elementum eu" }],
        },
      ],
    },
  ],
};

export const RTEWithContent = Template.bind({});
RTEWithContent.args = {
  body: TEST_STATE.body,
  onChange: (newBody: Body) => {},
  enableToolbar: true,
  readOnly: false,
};
