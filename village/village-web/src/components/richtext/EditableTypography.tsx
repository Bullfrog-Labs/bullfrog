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
  readOnly?: boolean;
  initialValue?: string;
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

const slateNodeToString = (title: RichText): string =>
  SlateNode.leaf(title[0], [0]).text;

export const EditableTypography: FunctionComponent<EditableTypographyProps> = (
  props
) => {
  const [value, setValue] = useState<RichText>([
    {
      type: "paragraph",
      children: [{ text: props.initialValue ?? "" }],
    },
  ]);

  const editor = useMemo(
    () => withReact(withEditableTypographyLayout(withHistory(createEditor()))),
    []
  );

  const onChange = (newValue: RichText) => {
    setValue(newValue);
    if (!!props.onChange) {
      props.onChange(slateNodeToString(newValue));
    }
  };

  const renderLeaf = useCallback(
    ({ children, attributes }) => (
      <Typography variant={props.variant} {...attributes}>
        {children}
      </Typography>
    ),
    [props.variant]
  );

  return (
    <Slate editor={editor} value={value} onChange={onChange}>
      <Editable
        readOnly={props.readOnly ?? false}
        placeholder="Enter a title"
        renderLeaf={renderLeaf}
        onKeyDown={handleExitEditable(props.handleEscape)}
      />
    </Slate>
  );
};
