import { forwardRef, useImperativeHandle, useMemo } from "react";
import { withResetBlockOnInsertBreak } from "./EditorBehaviors";
import {
  ReactEditor,
  withReact,
  Slate,
  Editable,
  RenderElementProps,
  RenderLeafProps,
} from "slate-react";

import { withHistory } from "slate-history";
import { createEditor, Operation } from "slate";

import { RichText } from "./Types";
import { Element, Leaf } from "./Rendering";
import RichTextEditorToolbar from "./RichTextEditorToolbar";

import { hotkeyHandler, toReactKBEventHandler } from "./EventHandling";

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

export type RichTextEditorImperativeHandle = {
  focusEditor: () => void;
};

const RichTextEditor = forwardRef<
  RichTextEditorImperativeHandle,
  RichTextEditorProps
>((props, ref) => {
  const editor = useMemo(
    () => withReact(withResetBlockOnInsertBreak(withHistory(createEditor()))),
    []
  );

  useImperativeHandle(ref, () => ({
    focusEditor: () => ReactEditor.focus(editor),
  }));

  const renderElement = (props: RenderElementProps) => <Element {...props} />;
  const renderLeaf = (props: RenderLeafProps) => <Leaf {...props} />;

  const onChange = (newBody: Body) => {
    if (didOpsAffectContent(editor.operations)) {
      props.onChange(newBody);
    }
  };

  return (
    <Slate editor={editor} value={props.body} onChange={onChange}>
      {!!props.enableToolbar && <RichTextEditorToolbar />}
      <Editable
        readOnly={props.readOnly ?? true}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some text"
        spellCheck
        autoFocus
        onKeyDown={toReactKBEventHandler(hotkeyHandler(editor))}
      />
    </Slate>
  );
});

export default RichTextEditor;
