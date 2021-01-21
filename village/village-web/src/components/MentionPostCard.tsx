import * as log from "loglevel";
import React from "react";
import { Typography, Paper } from "@material-ui/core";
import { PostRecord } from "../services/store/Posts";
import { Link } from "react-router-dom";
import { useGlobalStyles } from "../styles/styles";
import { postURL } from "../routing/URLs";
import { DateTime } from "luxon";
import { MentionInContext } from "../components/richtext/Utils";
import { RichTextCompactViewer } from "../components/richtext/RichTextEditor";

const listKeyForPost = (post: PostRecord) => `${post.id!}`;

export const MentionPostCard = (props: { mention: MentionInContext }) => {
  const globalClasses = useGlobalStyles();
  const { mention } = props;
  const { truncatedStart, truncatedEnd, text } = mention;
  const post = mention.post.post;
  const dt = DateTime.fromJSDate(post.updatedAt || new Date());

  const preview = (
    <React.Fragment>
      {truncatedStart && <Typography>⋯</Typography>}
      <RichTextCompactViewer body={text} />
      {truncatedEnd && <Typography>⋯</Typography>}
    </React.Fragment>
  );

  return (
    <Paper className={globalClasses.postPreviewCard} elevation={0}>
      <Typography
        variant="body1"
        className={globalClasses.cardTitle}
        gutterBottom
      >
        <Link
          className={globalClasses.link}
          key={listKeyForPost(post)}
          to={postURL(post.authorId, post.id!)}
          style={{ display: "inline" }}
        >
          {post.title}
        </Link>
        <span className={globalClasses.cardTitleDatePart}>
          <em>by {mention.post.user.displayName}</em>
        </span>
        <span className={globalClasses.cardTitleDatePart}>
          {dt.toFormat("MMM d")}
        </span>
      </Typography>
      {preview}
    </Paper>
  );
};
