import { Tooltip, Typography } from "@material-ui/core";
import * as log from "loglevel";
import React from "react";
import { Link } from "react-router-dom";
import { useFocused, useSelected } from "slate-react";
import { postURLById } from "../../routing/URLs";
import { useGlobalStyles } from "../../styles/styles";
import { Blockquote } from "../Blockquote";
import { MentionElementProps } from "@blfrg.xyz/slate-plugins";

export const MentionElement = ({
  attributes,
  children,
  element,
  htmlAttributes,
  onClick,
}: MentionElementProps) => {
  const globalClasses = useGlobalStyles();
  const logger = log.getLogger("MentionElement");
  const postId = element["postId"] as string;
  const authorId = element["authorId"] as string;
  const authorUsername = element["authorUsername"] as string;
  const title = element.value;
  const selected = useSelected();
  const focused = useFocused();

  if (!postId || !authorId || !authorUsername || !element.value) {
    logger.warn(
      `Invalid MentionNodeData; postId=${postId}, authorId=${authorId}, ` +
        `authorUsername=${authorUsername}, title=${title}`
    );
  }

  const handleClick = (event: any) => {
    if (onClick) {
      onClick({ value: title, children: [] });
    }
  };

  const linkClassName =
    focused && selected
      ? globalClasses.focusedSelectedLink
      : globalClasses.link;

  return (
    <Tooltip title={authorUsername}>
      <Link
        {...attributes}
        className={`${linkClassName} ${globalClasses.alwaysBreakWord}`}
        data-slate-value={title}
        to={postURLById(authorId, postId)}
        contentEditable={false}
        onClick={handleClick}
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
      className={`${globalClasses.link} ${globalClasses.alwaysBreakWord}`}
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
  const globalClasses = useGlobalStyles();
  return (
    <Typography
      className={`${globalClasses.alwaysBreakWord}`}
      paragraph={true}
      variant="body1"
    >
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
      className={`${globalClasses.compactParagraph} ${globalClasses.alwaysBreakWord}`}
    >
      {props.children}
    </Typography>
  );
};

export const H2Element = (props: any) => {
  const globalClasses = useGlobalStyles();
  return (
    <Typography variant="h2" className={`${globalClasses.alwaysBreakWord}`}>
      {props.children}
    </Typography>
  );
};

export const CompactH2Element = (props: any) => {
  const globalClasses = useGlobalStyles();
  return (
    <Typography
      style={{ fontWeight: 500 }}
      className={`${globalClasses.alwaysBreakWord}`}
      variant="body1"
    >
      {props.children}
    </Typography>
  );
};

export const H3Element = (props: any) => {
  const globalClasses = useGlobalStyles();
  return (
    <Typography variant="h3" className={`${globalClasses.alwaysBreakWord}`}>
      {props.children}
    </Typography>
  );
};

export const CompactH3Element = (props: any) => {
  const globalClasses = useGlobalStyles();
  return (
    <Typography
      style={{ fontWeight: 400 }}
      variant="body1"
      className={`${globalClasses.alwaysBreakWord}`}
    >
      {props.children}
    </Typography>
  );
};
