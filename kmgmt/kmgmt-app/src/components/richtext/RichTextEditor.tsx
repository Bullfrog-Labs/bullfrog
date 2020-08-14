import React, { useState, useCallback, useMemo } from "react";
import { ReactEditor, withReact, Slate, Editable } from "slate-react";
import { createEditor } from "slate";
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

type Title = string;
type Body = RichText;

export type Field = "title" | "body";

export type RichTextState = {
  title?: Title;
  body?: Body;
};

export type RichTextEditorProps = {
  onStateChange: (newState: RichTextState, updatedFields: Field[]) => void;
  enableToolbar?: boolean;
};

const RichTextEditor = (props: RichTextEditorProps) => {
  const { onStateChange, enableToolbar } = props;

  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  const [title, setTitle] = useState<Title | undefined>(undefined);
  const [body, setBody] = useState<Body>(EMPTY_RICH_TEXT);

  const editor = useMemo(
    () => withReact(withResetBlockOnInsertBreak(withHistory(createEditor()))),
    []
  );

  const titleOnChange = (newTitle?: Title) => {
    setTitle(newTitle);
    onStateChange({ title: newTitle, body: body }, ["title"]);
  };

  const bodyOnChange = (newBody: Body) => {
    setBody(newBody);
    onStateChange({ title: title, body: newBody }, ["body"]);
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
                onStateChange={titleOnChange}
              />
            </Grid>
            <Grid item>
              <Slate editor={editor} value={body} onChange={bodyOnChange}>
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
