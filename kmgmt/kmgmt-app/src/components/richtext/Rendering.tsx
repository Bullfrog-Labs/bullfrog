import React, { FunctionComponent } from "react";
import { Typography } from "@material-ui/core";
import { RenderLeafProps, RenderElementProps } from "slate-react";
import { Nodes } from "kmgmt-common";

export const Element: FunctionComponent<RenderElementProps> = ({
  attributes,
  children,
  element,
}) => {
  switch (element.type) {
    case "block-quote":
      return (
        <blockquote {...attributes}>
          <Typography variant="body1">{children}</Typography>
        </blockquote>
      );
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "heading-1":
      return (
        <Typography variant="h2" {...attributes}>
          {children}
        </Typography>
      );
    case "heading-2":
      return (
        <Typography variant="h3" {...attributes}>
          {children}
        </Typography>
      );
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>;
    default:
      return (
        <Typography variant="body1" paragraph={true} {...attributes}>
          {children}
        </Typography>
      );
  }
};

export const Leaf: FunctionComponent<RenderLeafProps> = ({
  attributes,
  children,
  leaf,
}) => {
  // Convert to kmgmt Text.
  const text = Nodes.fromTextObject(leaf);
  if (text.bold) {
    children = <strong>{children}</strong>;
  }
  if (text.code) {
    children = <code>{children}</code>;
  }
  if (text.italics) {
    children = <em>{children}</em>;
  }
  if (text.underline) {
    children = <u>{children}</u>;
  }
  return <span {...attributes}>{children}</span>;
};
