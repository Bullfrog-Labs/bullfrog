import React from "react";
import {
  ReactEditor,
  withReact,
  Slate,
  Editable,
  RenderElementProps,
  RenderLeafProps,
} from "slate-react";
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

// TODO: Need to pull out DocumentTitle.
class RichTextEditor extends React.Component {
  props: RichTextEditorProps;
  editor: ReactEditor;

  constructor(props: RichTextEditorProps) {
    super(props);
    this.props = props;

    this.editor = withReact(
      withResetBlockOnInsertBreak(withHistory(createEditor()))
    );
  }

  render() {
    const renderElement = (props: RenderElementProps) => <Element {...props} />;
    const renderLeaf = (props: RenderLeafProps) => <Leaf {...props} />;

    const onChange = {
      title: (newTitle: Title) => {
        if (this.props.title === newTitle) {
          return;
        }
        this.props.onTitleChange(newTitle);
      },
      body: (newBody: Body) => {
        if (didOpsAffectContent(this.editor.operations)) {
          this.props.onBodyChange(newBody);
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
                  readOnly={this.props.readOnly}
                  handleEscape={() => {
                    ReactEditor.focus(this.editor);
                  }}
                  value={this.props.title}
                  onChange={onChange.title}
                />
              </Grid>
              <Grid item>
                <Slate
                  editor={this.editor}
                  value={this.props.body}
                  onChange={onChange.body}
                >
                  {!!this.props.enableToolbar && <RichTextEditorToolbar />}
                  <Editable
                    readOnly={this.props.readOnly ?? false}
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    placeholder="Enter some text"
                    spellCheck
                    autoFocus
                    onKeyDown={toReactKBEventHandler(
                      hotkeyHandler(this.editor)
                    )}
                  />
                </Slate>
              </Grid>
            </Grid>
          </Container>
        </div>
      </Paper>
    );
  }
}

export default RichTextEditor;
