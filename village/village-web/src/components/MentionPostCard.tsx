import * as log from "loglevel";
import React from "react";
import { Typography, Paper } from "@material-ui/core";
import { PostRecord } from "../services/store/Posts";
import { Link, useHistory } from "react-router-dom";
import { useGlobalStyles } from "../styles/styles";
import { postURL } from "../routing/URLs";
import { DateTime } from "luxon";
import { MentionInContext } from "../components/richtext/Utils";
import { RichTextCompactViewer } from "../components/richtext/RichTextEditor";

const listKeyForPost = (post: PostRecord) => `${post.id!}`;

export const MentionPostCard = (props: { mention: MentionInContext }) => {
  const globalClasses = useGlobalStyles();
  const history = useHistory();
  const { mention } = props;
  const post = mention.post.post;
  const dt = DateTime.fromJSDate(post.updatedAt || new Date());
  const previewParts = [<RichTextCompactViewer body={mention.text} />];
  if (mention.truncatedStart) {
    previewParts.unshift(<Typography variant="body2">⋯</Typography>);
  }
  if (mention.truncatedEnd) {
    previewParts.push(<Typography variant="body2">⋯</Typography>);
  }
  const preview = <React.Fragment>{previewParts}</React.Fragment>;

  return (
    <Paper
      className={globalClasses.postPreviewCard}
      elevation={0}
      onClick={() => {
        history.push(postURL(post.authorId, post.id!));
      }}
    >
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
