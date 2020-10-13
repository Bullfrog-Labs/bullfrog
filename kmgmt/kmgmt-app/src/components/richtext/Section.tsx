import { makeStyles, Typography } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { Node } from "slate";
import {
  ReactEditor,
  RenderElementProps,
  useEditor,
  useFocused,
  useSelected,
} from "slate-react";

const useStyles = makeStyles((theme) => ({
  emptySectionTitle: {
    "& br": {
      display: "none", // Slate adds a <br> for empty leaves
    },
    "& .selected::after": {
      color: theme.palette.text.secondary,
      pointerEvents: "none",
      content: `"Add a section title"`,
    },
  },
}));

export const SectionTitle: FunctionComponent<RenderElementProps> = ({
  attributes,
  children,
  element,
}) => {
  const classes = useStyles();

  const editor = useEditor();
  const path = ReactEditor.findPath(editor, element);
  const level = path.length;
  const max_level_for_block_style_section_title = 5;

  const variant =
    level <= max_level_for_block_style_section_title ? `h${level}` : "body1";

  const isEmpty = Node.string(element) === "";

  const selected = useSelected();
  const focused = useFocused();

  if (selected && focused) {
    children = <div className="selected">{children}</div>;
  }

  return (
    <Typography
      className={isEmpty ? classes.emptySectionTitle : ""}
      variant={variant}
      {...attributes}
    >
      {children}
    </Typography>
  );
};

/*
export const Section: FunctionComponent<RenderElementProps> = ({
  attributes,
  children,
  element,
}) => {
  return <div>{children}</div>;
};
*/
