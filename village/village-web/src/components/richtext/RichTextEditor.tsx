import React, { useMemo, forwardRef, useImperativeHandle } from "react";
import { ReactEditor, withReact, Slate } from "slate-react";
import { createEditor, Operation } from "slate";
import { withHistory } from "slate-history";
import { RichText } from "./Types";
import { EMPTY_RICH_TEXT } from "./Utils";
import { LooksOne, LooksTwo } from "@styled-icons/material";
import {
  MentionElement,
  H5Element,
  H6Element,
  ParagraphElement,
} from "./Rendering";
import * as log from "loglevel";
import {
  MentionPlugin,
  MentionPluginOptions,
  ParagraphPlugin,
  ParagraphPluginOptions,
  HeadingPlugin,
  HeadingPluginOptions,
  MentionSelect,
  MentionNodeData,
  HeadingToolbar,
  ToolbarElement,
  useMention,
  withInlineVoid,
  pipe,
  ELEMENT_H5,
  ELEMENT_H6,
} from "@blfrg.xyz/slate-plugins";
import { EditablePlugins } from "@blfrg.xyz/slate-plugins-core";

// TODO: Figure out why navigation within text using arrow keys does not work
// properly, whereas using control keys works fine.

// The implementation below is based off of
// https://github.com/ianstormtaylor/slate/blob/master/site/examples/richtext.js.

export type Body = RichText;

export const EMPTY_RICH_TEXT_STATE = {
  title: "",
  body: EMPTY_RICH_TEXT,
};

export type RichTextEditorProps = {
  body: Body;
  onChange: (newBody: Body) => void;
  enableToolbar?: boolean;
  readOnly?: boolean;
  onMentionSearchChanged?: (search: string) => void;
  mentionables?: MentionNodeData[];
  onMentionAdded?: (option: MentionNodeData) => void;
};

const didOpsAffectContent = (ops: Operation[]): boolean => {
  return ops.some((op) => !Operation.isSelectionOperation(op));
};

const mentionOptions: MentionPluginOptions = {
  mention: {
    component: MentionElement,
  },
};

const paragraphOptions: ParagraphPluginOptions = {
  p: {
    component: ParagraphElement,
  },
};

const headingOptions: HeadingPluginOptions = {
  h5: {
    component: H5Element,
  },
  h6: {
    component: H6Element,
  },
};

const plugins = [
  ParagraphPlugin(paragraphOptions),
  HeadingPlugin(headingOptions),
  MentionPlugin(mentionOptions),
];

const withPlugins = [
  withReact,
  withHistory,
  withInlineVoid({ plugins }),
] as const;

export type RichTextEditorImperativeHandle = {
  focusEditor: () => void;
};

const RichTextEditor = forwardRef<
  RichTextEditorImperativeHandle,
  RichTextEditorProps
>((props, ref) => {
  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

  console.log("fuuuuuu");

  let onMentionAdded = props.onMentionAdded;
  if (!onMentionAdded) {
    onMentionAdded = (option: MentionNodeData) => {};
  }

  useImperativeHandle(ref, () => ({
    focusEditor: () => ReactEditor.focus(editor),
  }));

  const {
    onAddMention,
    onChangeMention,
    onKeyDownMention,
    search,
    index,
    target,
    values,
  } = useMention(props.mentionables, onMentionAdded, {
    maxSuggestions: 10,
  });
  const onChange = (newBody: Body) => {
    if (didOpsAffectContent(editor.operations)) {
      props.onChange(newBody);
    }
  };

  const toolbar = (
    <React.Fragment>
      <HeadingToolbar>
        <ToolbarElement type={ELEMENT_H5} icon={<LooksOne />} />
        <ToolbarElement type={ELEMENT_H6} icon={<LooksTwo />} />
      </HeadingToolbar>
    </React.Fragment>
  );
  return (
    <Slate
      editor={editor}
      value={props.body}
      onChange={(newValue) => {
        onChange(newValue);
        onChangeMention(editor);
      }}
    >
      {!!props.enableToolbar && toolbar}
      <EditablePlugins
        plugins={plugins}
        readOnly={props.readOnly ?? false}
        placeholder="Enter some text"
        spellCheck
        autoFocus
        onKeyDown={[onKeyDownMention]}
        onKeyDownDeps={[index, search, target]}
      />
      <MentionSelect
        at={target}
        valueIndex={index}
        options={values}
        onClickMention={onAddMention}
      />
    </Slate>
  );
});

export default RichTextEditor;
