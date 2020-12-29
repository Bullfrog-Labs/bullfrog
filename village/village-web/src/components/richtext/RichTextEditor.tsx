import React, { useMemo } from "react";
import { ReactEditor, withReact, Slate } from "slate-react";
import { createEditor, Operation } from "slate";
import { withHistory } from "slate-history";
import { Grid, Container, Paper, Typography } from "@material-ui/core";
import DocumentTitle from "./DocumentTitle";
import { RichText } from "./Types";
import { EMPTY_RICH_TEXT_V2 } from "./Utils";
import { LooksOne, LooksTwo } from "@styled-icons/material";
import {
  EditablePlugins,
  MentionPlugin,
  MentionPluginOptions,
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
} from "@blfrg.xyz/slate-plugins";
import { Link } from "react-router-dom";

// TODO: Figure out why navigation within text using arrow keys does not work
// properly, whereas using control keys works fine.

// The implementation below is based off of
// https://github.com/ianstormtaylor/slate/blob/master/site/examples/richtext.js.

export type Title = string;
export type Body = RichText;

export type RichTextState = {
  title: Title;
  body: Body;
};

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
  title: Title;
  body: Body;
  onTitleChange: (newTitle: Title) => void;
  onBodyChange: (newBody: Body) => void;
  enableToolbar?: boolean;
  readOnly?: boolean;
};

const didOpsAffectContent = (ops: Operation[]): boolean => {
  return ops.some((op) => !Operation.isSelectionOperation(op));
};

const MentionElement = ({
  attributes,
  children,
  element,
  htmlAttributes,
}: any) => {
  const postId = "dummy";
  return (
    <Link
      {...attributes}
      data-slate-value={element.value}
      to={`/post/${postId}`}
      contentEditable={false}
      {...htmlAttributes}
    >
      {element.value}
      {children}
    </Link>
  );
};
const ParagraphElement = (props: any) => {
  return (
    <Typography paragraph={true} variant="body1">
      {props.children}
    </Typography>
  );
};
const H5Element = (props: any) => {
  return <Typography variant="h5">{props.children}</Typography>;
};
const H6Element = (props: any) => {
  return <Typography variant="h6">{props.children}</Typography>;
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

const RichTextEditor = (props: RichTextEditorProps) => {
  const { title, body, onTitleChange, onBodyChange, enableToolbar } = props;

  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

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

  const onChange = {
    title: (newTitle: Title) => {
      if (title === newTitle) {
        return;
      }
      onTitleChange(newTitle);
    },
    body: (newBody: Body) => {
      if (didOpsAffectContent(editor.operations)) {
        onBodyChange(newBody);
      }
    },
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
    <Paper elevation={1}>
      <div className="RichTextEditor">
        <Container>
          <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="stretch"
            spacing={3}
          >
            <Grid item>
              <DocumentTitle
                readOnly={props.readOnly}
                handleEscape={(event) => {
                  ReactEditor.focus(editor);
                }}
                value={title}
                onChange={onChange.title}
              />
            </Grid>
            <Grid item>
              <Slate
                editor={editor}
                value={body}
                onChange={(newValue) => {
                  onChange.body(newValue);
                  onChangeMention(editor);
                }}
              >
                {!!enableToolbar && toolbar}
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
            </Grid>
          </Grid>
        </Container>
      </div>
    </Paper>
  );
};

export default RichTextEditor;
