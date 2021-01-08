import React from "react";
import { Typography, Tooltip } from "@material-ui/core";
import { Link } from "react-router-dom";
import * as log from "loglevel";

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
      <Tooltip title={authorUsername}>
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
