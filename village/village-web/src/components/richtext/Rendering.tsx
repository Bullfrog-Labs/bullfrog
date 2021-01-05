import React, { FunctionComponent } from "react";
import { Typography, Tooltip } from "@material-ui/core";
import { RenderLeafProps, RenderElementProps } from "slate-react";
import { Link } from "react-router-dom";
import * as log from "loglevel";

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
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.code) {
    children = <code>{children}</code>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  return <span {...attributes}>{children}</span>;
};

export const MentionElement = ({
  attributes,
  children,
  element,
  htmlAttributes,
}: any) => {
  const logger = log.getLogger("MentionElement");
  const postId = element["postId"];
  const authorId = element["authorId"];
  const authorUsername = element["authorUsername"];
  const title = element.value;
  if (!postId || !authorId || !authorUsername || !element.value) {
    logger.warn(
      `Invalid MentionNodeData; postId=${postId}, authorId=${authorId}, ` +
        `authorUsername=${authorUsername}, title=${title}`
    );
  }
  return (
    <React.Fragment>
      <Tooltip title={"Author: " + authorUsername}>
        <Link
          {...attributes}
          data-slate-value={title}
          to={`/post/${authorId}/${postId}`}
          contentEditable={false}
          {...htmlAttributes}
        >
          {element.value}
          {children}
        </Link>
      </Tooltip>
    </React.Fragment>
  );
};

export const ParagraphElement = (props: any) => {
  return (
    <Typography paragraph={true} variant="body1">
      {props.children}
    </Typography>
  );
};

export const H5Element = (props: any) => {
  return <Typography variant="h5">{props.children}</Typography>;
};

export const H6Element = (props: any) => {
  return <Typography variant="h6">{props.children}</Typography>;
};
