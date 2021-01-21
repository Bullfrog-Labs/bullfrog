import React from "react";
import { Typography, Paper } from "@material-ui/core";
import { PostRecord } from "../services/store/Posts";
import { Link } from "react-router-dom";
import { useGlobalStyles } from "../styles/styles";
import { postURLById } from "../routing/URLs";
import { postPreviewFromStart, isEmptyDoc } from "./richtext/Utils";
import { DateTime } from "luxon";
import { RichTextCompactViewer } from "../components/richtext/RichTextEditor";

export const ProfilePostCard = (props: { post: PostRecord }) => {
  const globalClasses = useGlobalStyles();
  const { post } = props;
  const dt = DateTime.fromJSDate(post.updatedAt || new Date());
  let preview = undefined;
  if (!isEmptyDoc(post.body)) {
    const [previewDoc, truncatedStart, truncatedEnd] = postPreviewFromStart(
      post.body
    );
    preview = (
      <React.Fragment>
        {truncatedStart && <Typography>⋯</Typography>}
        <RichTextCompactViewer body={previewDoc} />
        {truncatedEnd && <Typography>⋯</Typography>}
      </React.Fragment>
    );
  }

  const listKeyForPost = (post: PostRecord) => `${post.id!}`;
  return (
    <Paper
      className={globalClasses.postPreviewCard}
      elevation={0}
      key={listKeyForPost(post)}
    >
      <Typography
        variant="body1"
        className={globalClasses.cardTitle}
        gutterBottom
      >
        <Link
          className={globalClasses.link}
          to={postURLById(post.authorId, post.id!)}
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
          <em className={globalClasses.cardNoContent}>Empty post</em>
        </Typography>
      )}
    </Paper>
  );
};
