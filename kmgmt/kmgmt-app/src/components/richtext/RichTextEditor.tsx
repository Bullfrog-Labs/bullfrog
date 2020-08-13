import React, { useState, useCallback, useMemo } from "react";
import { ReactEditor, withReact, Slate, Editable } from "slate-react";
import { createEditor } from "slate";
import { withHistory } from "slate-history";

import { Grid, Container, Divider, Paper } from "@material-ui/core";
import { Node as SlateNode } from "slate";

import { hotkeyHandler, toReactKBEventHandler } from "./EventHandling";
import { Element, Leaf } from "./Rendering";
import { withResetBlockOnInsertBreak } from "./EditorBehaviors";
import { DocumentTitle } from "./DocumentTitle";

// TODO: Figure out why navigation within text using arrow keys does not work
// properly, whereas using control keys works fine.

// The implementation below is based off of
// https://github.com/ianstormtaylor/slate/blob/master/site/examples/richtext.js.

type Title = SlateNode[];
type Body = SlateNode[];

interface NoteRecord {
  title: Title;
  body: Body;
}

const emptyNoteRecord: NoteRecord = {
  title: [
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
  ],
  body: [
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
  ],
};

const RichTextEditor = () => {
  // TODO: Modify value to also include document title.
  // TODO: Modify document title to be synced with state.
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  const [title, setTitle] = useState<Title>(emptyNoteRecord.title);
  const [body, setBody] = useState<Body>(emptyNoteRecord.body);

  const editor = useMemo(
    () => withReact(withResetBlockOnInsertBreak(withHistory(createEditor()))),
    []
  );

  const bodyOnChange = (newBody: Body) => {
    setBody(newBody);
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
                onStateChange={setTitle}
              />
            </Grid>
            <Grid item>
              {/* <RichTextEditorToolbar /> */}
              {/*

              <Slate editor={editor} value={body} onChange={bodyOnChange}>
                <Editable
                  renderElement={renderElement}
                  renderLeaf={renderLeaf}
                  placeholder="Enter some text"
                  spellCheck
                  autoFocus
                  onKeyDown={toReactKBEventHandler(hotkeyHandler(editor))}
                />
              </Slate>
              
              */}
            </Grid>
          </Grid>
        </Container>
      </div>
    </Paper>
  );
};

export default RichTextEditor;
