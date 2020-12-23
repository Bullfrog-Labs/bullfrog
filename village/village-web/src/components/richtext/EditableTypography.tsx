import React, { FunctionComponent, useMemo, useCallback } from "react";
import { createEditor } from "slate";
import { KBEventHandler, RichText } from "./Types";
import { withEditableTypographyLayout } from "./EditorBehaviors";
import { withHistory } from "slate-history";
import { withReact, Slate, Editable } from "slate-react";

import { Typography } from "@material-ui/core";
import { slateNodeToString, stringToSlateNode } from "./Utils";

export type EditableTypographyProps = {
  readOnly?: boolean;
  value: string;
  variant?: string;
  handleEscape?: KBEventHandler;
  onChange?: (newValue: string) => void;
};

const handleExitEditable = (handleEscape?: KBEventHandler) => (
  event: React.KeyboardEvent
) => {
  if (event.key === "Enter" || event.key === "Escape") {
    event.preventDefault();
    if (handleEscape) {
      handleEscape(event.nativeEvent);
    }
  }
};

export const EditableTypography: FunctionComponent<EditableTypographyProps> = (
  props
) => {
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
};
