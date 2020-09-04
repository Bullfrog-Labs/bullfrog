import React, { FunctionComponent } from "react";
import { Typography } from "@material-ui/core";
import { RenderLeafProps, RenderElementProps } from "slate-react";
import { TypedElement, MarkType, MarkTypes } from "kmgmt-common";
import * as log from "loglevel";

export const Element: FunctionComponent<RenderElementProps> = ({
  attributes,
  children,
  element,
}) => {
  const logger = log.getLogger("Rendering");
  if (TypedElement.isTypedElement(element)) {
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
      case "paragraph":
        return (
          <Typography variant="body1" paragraph={true} {...attributes}>
            {children}
          </Typography>
        );
      case "document":
        return children;
    }
  } else {
    logger.warn(`Unhandled element, ignoring ${JSON.stringify(element)}`);
    return <React.Fragment />;
  }
};

const renderMark = (markType: MarkType, children: JSX.Element): JSX.Element => {
  switch (markType) {
    case "bold":
      return <strong>{children}</strong>;
    case "italic":
      return <em>{children}</em>;
    case "code":
      return <code>{children}</code>;
    case "underline":
      return <u>{children}</u>;
  }
};

export const Leaf: FunctionComponent<RenderLeafProps> = ({
  attributes,
  children,
  leaf,
}) => {
  // Doing this with reduce lets us rely on the type system to ensure all the
  // cases are handled. If we forget a mark, tsc will barf.
  const markedText = MarkTypes.reduce((el: JSX.Element, mark: MarkType) => {
    if (mark in leaf) {
      return renderMark(mark, el);
    } else {
      // Ignore the mark, do nothing
      return <React.Fragment>{el}</React.Fragment>;
    }
  }, children);
  return <span {...attributes}>{markedText}</span>;
};
