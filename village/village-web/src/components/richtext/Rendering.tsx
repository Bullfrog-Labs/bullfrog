import { Tooltip, Typography } from "@material-ui/core";
import * as log from "loglevel";
import React from "react";
import { Link } from "react-router-dom";
import { useFocused, useSelected } from "slate-react";
import { postURLById } from "../../routing/URLs";
import { useGlobalStyles } from "../../styles/styles";
import { Blockquote } from "../Blockquote";

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
  const selected = useSelected();
  const focused = useFocused();

  if (!postId || !authorId || !authorUsername || !element.value) {
    logger.warn(
      `Invalid MentionNodeData; postId=${postId}, authorId=${authorId}, ` +
        `authorUsername=${authorUsername}, title=${title}`
    );
  }
  return (
    <Tooltip title={authorUsername}>
      <Link
        {...attributes}
        className={
          focused && selected
            ? globalClasses.focusedSelectedLink
            : globalClasses.link
        }
        data-slate-value={title}
        to={postURLById(authorId, postId)}
        contentEditable={false}
        {...htmlAttributes}
      >
        {element.value}
        {children}
      </Link>
    </Tooltip>
  );
};

export const LinkElement = ({
  attributes,
  children,
  element,
  htmlAttributes,
}: any) => {
  const globalClasses = useGlobalStyles();
  return (
    <a
      {...attributes}
      data-slate-value={element.url}
      className={globalClasses.link}
      href={element.url}
      contentEditable={false}
      {...htmlAttributes}
    >
      {children}
    </a>
  );
};

export const BlockquoteElement = ({
  attributes,
  children,
  htmlAttributes,
}: any) => {
  return <Blockquote>{children}</Blockquote>;
};

export const CompactBlockquoteElement = ({
  attributes,
  children,
  htmlAttributes,
}: any) => {
  const globalClasses = useGlobalStyles();
  return (
    <Blockquote className={globalClasses.compactBlockquote}>
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

export const CompactH2Element = (props: any) => {
  return (
    <Typography style={{ fontWeight: 500 }} variant="body1">
      {props.children}
    </Typography>
  );
};

export const H3Element = (props: any) => {
  return <Typography variant="h3">{props.children}</Typography>;
};

export const CompactH3Element = (props: any) => {
  return (
    <Typography style={{ fontWeight: 400 }} variant="body1">
      {props.children}
    </Typography>
  );
};
