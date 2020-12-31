import React, { useMemo } from "react";
import { ReactEditor, withReact, Slate } from "slate-react";
import { createEditor, Operation } from "slate";
import { withHistory } from "slate-history";
import { Typography } from "@material-ui/core";
import { RichText } from "./Types";
import { EMPTY_RICH_TEXT_V2 } from "./Utils";
import { LooksOne, LooksTwo } from "@styled-icons/material";
import {
  EditablePlugins,
  MentionPlugin,
  ParagraphPlugin,
  ParagraphPluginOptions,
  HeadingPlugin,
  HeadingPluginOptions,
  MentionSelect,
  HeadingToolbar,
  ToolbarElement,
  useMention,
  withInlineVoid,
  pipe,
  ELEMENT_H5,
  ELEMENT_H6,
} from "@udecode/slate-plugins";

// TODO: Figure out why navigation within text using arrow keys does not work
// properly, whereas using control keys works fine.

// The implementation below is based off of
// https://github.com/ianstormtaylor/slate/blob/master/site/examples/richtext.js.

export type Body = RichText;

const MENTIONABLES = [
  { value: "Aayla Secura" },
  { value: "Adi Gallia" },
  { value: "Admiral Dodd Rancit" },
  { value: "Admiral Firmus Piett" },
];

export const EMPTY_RICH_TEXT_STATE = {
  title: "",
  body: EMPTY_RICH_TEXT_V2,
};

export type RichTextEditorProps = {
  body: Body;
  onChange: (newBody: Body) => void;
  enableToolbar?: boolean;
  readOnly?: boolean;
};

const didOpsAffectContent = (ops: Operation[]): boolean => {
  return ops.some((op) => !Operation.isSelectionOperation(op));
};

const ParagraphElement = (props: any) => {
  return (
    <p>
      <Typography variant="body1">{props.children}</Typography>
    </p>
  );
};
const H5Element = (props: any) => {
  return <Typography variant="h5">{props.children}</Typography>;
};
const H6Element = (props: any) => {
  return <Typography variant="h6">{props.children}</Typography>;
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
  MentionPlugin(),
];

const withPlugins = [
  withReact,
  withHistory,
  withInlineVoid({ plugins }),
] as const;

class RichTextEditor extends React.Component {
  props: RichTextEditorProps;
  editor: ReactEditor;

  constructor(props: RichTextEditorProps) {
    super(props);
    this.props = props;
    this.editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);
  }

  focusEditor() {
    ReactEditor.focus(this.editor);
  }

  render() {
    const {
      onAddMention,
      onChangeMention,
      onKeyDownMention,
      search,
      index,
      target,
      values,
    } = useMention(MENTIONABLES, {
      maxSuggestions: 10,
      trigger: "@",
    });

    const onChange = (newBody: Body) => {
      if (didOpsAffectContent(this.editor.operations)) {
        this.props.onChange(newBody);
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
        editor={this.editor}
        value={this.props.body}
        onChange={(newValue) => {
          onChange(newValue);
          onChangeMention(this.editor);
        }}
      >
        {!!this.props.enableToolbar && toolbar}
        <EditablePlugins
          plugins={plugins}
          readOnly={this.props.readOnly ?? false}
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
  }
}

export default RichTextEditor;
