import * as log from "loglevel";
import React from "react";
import { Typography, Paper } from "@material-ui/core";
import { PostRecord } from "../services/store/Posts";
import { Link, useHistory } from "react-router-dom";
import { useGlobalStyles } from "../styles/styles";
import { postURL } from "../routing/URLs";
import { postPreviewFromStart, isEmptyDoc } from "./richtext/Utils";
import { DateTime } from "luxon";
import { RichTextCompactViewer } from "../components/richtext/RichTextEditor";

const listKeyForPost = (post: PostRecord) => `${post.id!}`;

export const ProfilePostCard = (props: { post: PostRecord }) => {
  const globalClasses = useGlobalStyles();
  const history = useHistory();
  const { post } = props;
  const dt = DateTime.fromJSDate(post.updatedAt || new Date());
  let preview = undefined;
  if (!isEmptyDoc(post.body)) {
    const [previewDoc, truncatedStart, truncatedEnd] = postPreviewFromStart(
      post.body
    );
    const previewParts = [<RichTextCompactViewer body={previewDoc} />];
    if (truncatedStart) {
      previewParts.unshift(<Typography>⋯</Typography>);
    }
    if (truncatedEnd) {
      previewParts.push(<Typography>⋯</Typography>);
    }
    preview = <React.Fragment>{previewParts}</React.Fragment>;
  }

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
          {dt.toFormat("MMM d")}
        </span>
      </Typography>
      {preview ? (
        <>{preview}</>
      ) : (
        <Typography
          paragraph={false}
          variant="body2"
          className={globalClasses.cardEmptyPreview}
        >
          <em className={globalClasses.cardNoContent}>No content</em>
        </Typography>
      )}
    </Paper>
  );
};
