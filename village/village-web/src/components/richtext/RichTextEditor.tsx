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

import { hotkeyHandler, toReactKBEventHandler } from "./EventHandling";
import { Element, Leaf } from "./Rendering";
import { withResetBlockOnInsertBreak } from "./EditorBehaviors";
import RichTextEditorToolbar from "./RichTextEditorToolbar";
import { RichText } from "./Types";

// TODO: Figure out why navigation within text using arrow keys does not work
// properly, whereas using control keys works fine.

// The implementation below is based off of
// https://github.com/ianstormtaylor/slate/blob/master/site/examples/richtext.js.

export type Body = RichText;

export type RichTextEditorProps = {
  body: Body;
  onChange: (newBody: Body) => void;
  enableToolbar?: boolean;
  readOnly?: boolean;
};

const didOpsAffectContent = (ops: Operation[]): boolean => {
  return ops.some((op) => !Operation.isSelectionOperation(op));
};

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

  focusEditor() {
    ReactEditor.focus(this.editor);
  }

  render() {
    const renderElement = (props: RenderElementProps) => <Element {...props} />;
    const renderLeaf = (props: RenderLeafProps) => <Leaf {...props} />;

    const onChange = (newBody: Body) => {
      if (didOpsAffectContent(this.editor.operations)) {
        this.props.onChange(newBody);
      }
    };

    return (
      <Slate editor={this.editor} value={this.props.body} onChange={onChange}>
        {!!this.props.enableToolbar && <RichTextEditorToolbar />}
        <Editable
          readOnly={this.props.readOnly ?? false}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Enter some text"
          spellCheck
          autoFocus
          onKeyDown={toReactKBEventHandler(hotkeyHandler(this.editor))}
        />
      </Slate>
    );
  }
}

export default RichTextEditor;
