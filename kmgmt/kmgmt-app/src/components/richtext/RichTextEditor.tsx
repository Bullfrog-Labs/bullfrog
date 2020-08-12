import React, { useState, useCallback, useMemo } from "react";
import { ReactEditor, withReact, Slate, Editable, useSlate } from "slate-react";
import { createEditor, Editor, Text, Transforms } from "slate";
import { withHistory } from "slate-history";

import {
  Toolbar,
  Grid,
  Container,
  Divider,
  Typography,
} from "@material-ui/core";
import {
  Node as SlateNode,
  Element as SlateElement,
  Editor as SlateEditor,
} from "slate";

import { hotkeyHandler } from "./EventHandling";

// TODO: Figure out why navigation within text using arrow keys does not work
// properly, whereas using control keys works fine.

// The implementation below is based off of
// https://github.com/ianstormtaylor/slate/blob/master/site/examples/richtext.js.

// TODO: need to make it so that inserting a break from inside a heading does
// not cause the heading itself to become a paragraph.
const withResetBlockOnInsertBreak = (editor) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    insertBreak();

    for (let block in HEADING_BLOCKS.filter((x) => isBlockActive(editor, x))) {
      toggleBlock(editor, block);
    }
  };

  return editor;
};

const withEditableTypographyLayout = (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    if (Text.isText(node)) {
      // Make sure that there are no newlines in the text
      const newNode = {
        text: node.text.replace(/\r?\n|\r/g, ""),
      };
      Transforms.setNodes(editor, newNode, { at: path });
    } else {
      // Merge all nodes into a single text node
      if (path.length > 0 && path[path.length - 1] !== 0) {
        Transforms.mergeNodes(editor, { at: path, voids: true });
      }
    }

    return normalizeNode(entry);
  };

  return editor;
};

const EditableTypography = ({ initialValue, variant, handleEscape }) => {
  if (initialValue === undefined) {
    initialValue = [
      {
        type: "paragraph",
        children: [{ text: "" }],
      },
    ];
  }
  const [value, setValue] = useState(initialValue);
  const editor = useMemo(
    () => withEditableTypographyLayout(withHistory(withReact(createEditor()))),
    []
  );

  const renderLeaf = useCallback(
    ({ children, attributes }) => (
      <Typography variant={variant} {...attributes}>
        {children}
      </Typography>
    ),
    [variant]
  );

  return (
    <Slate editor={editor} value={value} onChange={setValue}>
      <Editable
        placeholder="Enter a title"
        renderLeaf={renderLeaf}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === "Escape") {
            event.preventDefault();
            if (handleEscape) {
              handleEscape(event);
            }
          }
        }}
      />
    </Slate>
  );
};

const DocumentTitle = (props) => {
  return <EditableTypography variant="h1" {...props} />;
};

type Title = string | undefined;
type Body = SlateNode[];

interface NoteRecord {
  title: Title;
  body: Body;
}

const emptyNoteRecord: NoteRecord = {
  title: undefined,
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
    () => withResetBlockOnInsertBreak(withHistory(withReact(createEditor()))),
    []
  );

  const bodyOnChange = (newBody: Body) => {
    setBody(newBody);
  };

  return (
    <div elevation={1} className="RichTextEditor">
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
            />
          </Grid>
          <Grid item>
            <Slate editor={editor} value={body} onChange={bodyOnChange}>
              <RichTextEditorToolbar />
              <Editable
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                placeholder="Enter some text"
                spellCheck
                autoFocus
                onKeyDown={hotkeyHandler(editor)}
              />
            </Slate>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default RichTextEditor;
