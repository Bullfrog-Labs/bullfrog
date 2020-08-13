import React, {
  FunctionComponent,
  useState,
  useMemo,
  useCallback,
} from "react";
import { Node as SlateNode, createEditor } from "slate";
import { KBEventHandler } from "./Types";
import { withEditableTypographyLayout } from "./EditorBehaviors";
import { withHistory } from "slate-history";
import { withReact, Slate, Editable } from "slate-react";

import { Typography } from "@material-ui/core";

export type EditableTypographyProps = {
  initialValue?: SlateNode[];
  variant?: string;
  handleEscape: KBEventHandler;
  onStateChange?: (newValue: SlateNode[]) => void;
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

export const EditableTypography: FunctionComponent<EditableTypographyProps> = ({
  initialValue,
  variant,
  handleEscape,
  onStateChange,
}) => {
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
    () => withReact(withEditableTypographyLayout(withHistory(createEditor()))),
    []
  );

  const onChange = (newValue: SlateNode[]) => {
    setValue(newValue);
    if (onStateChange) {
      onStateChange(newValue);
    }
  };

  const renderLeaf = useCallback(
    ({ children, attributes }) => (
      <Typography variant={variant} {...attributes}>
        {children}
      </Typography>
    ),
    [variant]
  );

  return (
    <Slate editor={editor} value={value} onChange={onChange}>
      <Editable
        placeholder="Enter a title"
        renderLeaf={renderLeaf}
        onKeyDown={handleExitEditable(handleEscape)}
      />
    </Slate>
  );
};