import { Typography } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { ReactEditor, RenderElementProps, useEditor } from "slate-react";

export const SectionTitle: FunctionComponent<RenderElementProps> = ({
  attributes,
  children,
  element,
}) => {
  const editor = useEditor();
  const path = ReactEditor.findPath(editor, element);
  const level = path.length;
  const max_level_for_block_style_section_title = 5;

  const variant =
    level <= max_level_for_block_style_section_title
      ? `h${level + 1}`
      : "body1";

  return (
    <Typography variant={variant} {...attributes}>
      {children}
    </Typography>
  );
};

export const Section: FunctionComponent<RenderElementProps> = ({
  attributes,
  children,
  element,
}) => {
  const editor = useEditor();
  const path = ReactEditor.findPath(editor, element);
  const divStyle = {
    borderLeftWidth: "thick",
    borderLeftColor: "gainsboro",
    borderLeftStyle: "solid",
    borderLeftRadius: "4px",
    padding: "4px",
  };

  return (
    <div style={divStyle} {...attributes}>
      {children}
    </div>
  );
};
