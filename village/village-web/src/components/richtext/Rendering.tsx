import React from "react";
import { Typography, Tooltip } from "@material-ui/core";
import { Link } from "react-router-dom";
import * as log from "loglevel";
import { Blockquote } from "../Blockquote";
import { useGlobalStyles } from "../../styles/styles";

export const MentionElement = ({
  attributes,
  children,
  element,
  htmlAttributes,
}: any) => {
  const globalClasses = useGlobalStyles();
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
      <Tooltip title={authorUsername}>
        <Link
          {...attributes}
          className={globalClasses.link}
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

export const BlockquoteElement = ({
  attributes,
  children,
  htmlAttributes,
}: any) => {
  return (
    <Blockquote {...attributes} {...htmlAttributes}>
      {children}
    </Blockquote>
  );
};

export const CompactBlockquoteElement = ({
  attributes,
  children,
  htmlAttributes,
}: any) => {
  const globalClasses = useGlobalStyles();
  return (
    <Blockquote
      {...attributes}
      {...htmlAttributes}
      className={globalClasses.compactBlockquote}
    >
      {children}
    </Blockquote>
  );
};

export const ParagraphElement = (props: any) => {
  return (
    <Typography paragraph={true} variant="body1">
      {props.children}
    </Typography>
  );
};

export const CompactParagraphElement = (props: any) => {
  const globalClasses = useGlobalStyles();
  return (
    <Typography
      paragraph={true}
      variant="body1"
      className={globalClasses.compactParagraph}
    >
      {props.children}
    </Typography>
  );
};

export const H2Element = (props: any) => {
  return <Typography variant="h2">{props.children}</Typography>;
};

export const H3Element = (props: any) => {
  return <Typography variant="h3">{props.children}</Typography>;
};
