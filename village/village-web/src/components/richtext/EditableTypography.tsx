import React, {
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { createEditor, Text, Node, Transforms } from "slate";
import { KBEventHandler, RichText } from "./Types";
import { withEditableTypographyLayout } from "./EditorBehaviors";
import { withHistory } from "slate-history";
import { withReact, Slate, Editable, ReactEditor } from "slate-react";

import { Typography } from "@material-ui/core";
import {
  EDITABLE_TYPOGRAPHY_TEXT_NODE_PATH,
  slateNodeToString,
  stringToSlateNode,
} from "./Utils";

export type EditableTypographyImperativeHandle = {
  blurEditor: () => void;
  deselect: () => void;
  setSelectionToEnd: () => void;
};

export type EditableTypographyProps = {
  readOnly?: boolean;
  value: string;
  variant?: string;
  handleEscape?: KBEventHandler;
  onChange?: (newValue: string) => void;
};

const handleExitEditable = (handleEscape?: KBEventHandler) => (
  event: React.KeyboardEvent<HTMLDivElement>
) => {
  if (event.key === "Enter" || event.key === "Escape") {
    event.preventDefault();
    if (handleEscape) {
      handleEscape(event.nativeEvent);
    }
  }
};

export const EditableTypography = forwardRef<
  EditableTypographyImperativeHandle,
  EditableTypographyProps
>((props, ref) => {
  const editor = useMemo(
    () => withReact(withEditableTypographyLayout(withHistory(createEditor()))),
    []
  );

  const onChange = (newValue: RichText) => {
    if (!!props.onChange) {
      props.onChange(slateNodeToString(newValue));
    }
  };

  // TOOD: I need to be able to create a reset function here. I also need to
  // make it callable from the parent component. This can be done using ref
  // forwarding, see https://reactjs.org/docs/forwarding-refs.html.
  // See
  // https://www.notion.so/Crash-due-to-Slate-cursor-being-in-invalid-position-when-post-rename-fails-due-to-post-name-taken-an-9904289b317d4fc68f6b918ef62ae780
  // for why this is needed.

  const renderLeaf = useCallback(
    ({ children, attributes }) => (
      <Typography variant={props.variant} {...attributes}>
        {children}
      </Typography>
    ),
    [props.variant]
  );

  useImperativeHandle(ref, () => ({
    blurEditor: () => ReactEditor.blur(editor),
    deselect: () => Transforms.deselect(editor),
    setSelectionToEnd: () => {
      const textNode = Node.get(editor, EDITABLE_TYPOGRAPHY_TEXT_NODE_PATH);
      if (!Text.isText(textNode)) {
        throw new Error("Got non-text node when expecting a text node");
      }
      const textEndOffset = textNode.text.length;
      const endPoint = {
        path: EDITABLE_TYPOGRAPHY_TEXT_NODE_PATH,
        offset: textEndOffset,
      };
      Transforms.select(editor, endPoint);
    },
  }));

  return (
    <Slate
      editor={editor}
      value={stringToSlateNode(props.value)}
      onChange={onChange}
    >
      <Editable
        readOnly={props.readOnly ?? false}
        placeholder="Enter a title"
        renderLeaf={renderLeaf}
        onKeyDown={handleExitEditable(props.handleEscape)}
      />
    </Slate>
  );
});
