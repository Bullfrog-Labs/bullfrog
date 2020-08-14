import React, {
  FunctionComponent,
  useState,
  useMemo,
  useCallback,
} from "react";
import { Node as SlateNode, createEditor } from "slate";
import { KBEventHandler, RichText } from "./Types";
import { withEditableTypographyLayout } from "./EditorBehaviors";
import { withHistory } from "slate-history";
import { withReact, Slate, Editable } from "slate-react";

import { Typography } from "@material-ui/core";

export type EditableTypographyProps = {
  initialValue?: string;
  variant?: string;
  handleEscape: KBEventHandler;
  onStateChange?: (newValue?: string) => void;
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

const slateNodeToString = (title: RichText): string =>
  SlateNode.leaf(title[0], [0]).text;

export const EditableTypography: FunctionComponent<EditableTypographyProps> = ({
  initialValue,
  variant,
  handleEscape,
  onStateChange,
}) => {
  const [value, setValue] = useState<RichText>([
    {
      type: "paragraph",
      children: [{ text: initialValue ?? "" }],
    },
  ]);

  const editor = useMemo(
    () => withReact(withEditableTypographyLayout(withHistory(createEditor()))),
    []
  );

  const onChange = (newValue: RichText) => {
    setValue(newValue);
    if (onStateChange) {
      onStateChange(slateNodeToString(newValue));
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
