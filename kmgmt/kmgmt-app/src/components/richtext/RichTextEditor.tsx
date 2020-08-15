import React, { useState, useCallback, useMemo } from "react";
import { ReactEditor, withReact, Slate, Editable } from "slate-react";
import { createEditor, Operation } from "slate";
import { withHistory } from "slate-history";

import { Grid, Container, Paper } from "@material-ui/core";

import { hotkeyHandler, toReactKBEventHandler } from "./EventHandling";
import { Element, Leaf } from "./Rendering";
import { withResetBlockOnInsertBreak } from "./EditorBehaviors";
import DocumentTitle from "./DocumentTitle";
import RichTextEditorToolbar from "./RichTextEditorToolbar";
import { RichText } from "./Types";
import { EMPTY_RICH_TEXT } from "./Utils";

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

export const EMPTY_RICH_TEXT_STATE = {
  title: "",
  body: EMPTY_RICH_TEXT,
};

export type RichTextEditorProps = {
  onTitleChange: (newTitle: Title) => void;
  onBodyChange: (newBody: Body) => void;
  enableToolbar?: boolean;
};

const didOpsAffectContent = (ops: Operation[]): boolean => {
  return ops.some((op) => !Operation.isSelectionOperation(op));
};

const RichTextEditor = (props: RichTextEditorProps) => {
  const { onTitleChange, onBodyChange, enableToolbar } = props;

  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  const [title, setTitle] = useState<Title>(EMPTY_RICH_TEXT_STATE.title);
  const [body, setBody] = useState<Body>(EMPTY_RICH_TEXT_STATE.body);

  const editor = useMemo(
    () => withReact(withResetBlockOnInsertBreak(withHistory(createEditor()))),
    []
  );

  const onChange = {
    title: (newTitle: Title) => {
      if (title === newTitle) {
        return;
      }
      setTitle(newTitle);
      onTitleChange(newTitle);
    },
    body: (newBody: Body) => {
      if (didOpsAffectContent(editor.operations)) {
        setBody(newBody);
        onBodyChange(newBody);
      }
    },
  };

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
                handleEscape={(event) => {
                  ReactEditor.focus(editor);
                }}
                initialValue={title}
                onChange={onChange.title}
              />
            </Grid>
            <Grid item>
              <Slate editor={editor} value={body} onChange={onChange.body}>
                {!!enableToolbar && <RichTextEditorToolbar />}
                <Editable
                  renderElement={renderElement}
                  renderLeaf={renderLeaf}
                  placeholder="Enter some text"
                  spellCheck
                  autoFocus
                  onKeyDown={toReactKBEventHandler(hotkeyHandler(editor))}
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
