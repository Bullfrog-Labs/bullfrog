import React, { FunctionComponent } from "react";
import { Node as SlateNode } from "slate";
import { Typography } from "@material-ui/core";

type ElementProps = {
  attributes: object;
  children: React.ReactChild[];
  element: SlateNode;
};

export const Element: FunctionComponent<ElementProps> = ({
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

type LeafProps = {
  attributes: object;
  children: React.ReactChild[];
  leaf: SlateNode;
};

export const Leaf: FunctionComponent<LeafProps> = ({
  attributes,
  children,
  leaf,
}) => {
  let leafElement;

  if (leaf.bold) {
    leafElement = <strong>{children}</strong>;
  }
  if (leaf.code) {
    leafElement = <code>{children}</code>;
  }
  if (leaf.italic) {
    leafElement = <em>{children}</em>;
  }
  if (leaf.underline) {
    leafElement = <u>{children}</u>;
  }
  return <span {...attributes}>{leafElement}</span>;
};
