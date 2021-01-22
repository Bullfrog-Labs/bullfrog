import React from "react";
import { Typography, Paper } from "@material-ui/core";
import { UserPost, PostRecord } from "../services/store/Posts";
import { Link } from "react-router-dom";
import { useGlobalStyles } from "../styles/styles";
import { postURLById } from "../routing/URLs";
import { DateTime } from "luxon";
import { RichTextCompactViewer } from "../components/richtext/RichTextEditor";
import { postPreviewFromStart } from "./richtext/Utils";

const listKeyForPost = (post: PostRecord) => `${post.id!}`;

export const StackPostCard = (props: { userPost: UserPost }) => {
  const globalClasses = useGlobalStyles();
  const { userPost } = props;
  const { post, user } = userPost;
  const [previewDoc, truncatedStart, truncatedEnd] = postPreviewFromStart(
    post.body
  );
  const dt = DateTime.fromJSDate(post.updatedAt || new Date());

  const preview = (
    <React.Fragment>
      {truncatedStart && <Typography>⋯</Typography>}
      <RichTextCompactViewer body={previewDoc} />
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
          to={postURLById(post.authorId, post.id!)}
          style={{ display: "inline" }}
        >
          {post.title}
        </Link>
        <span className={globalClasses.cardTitleDatePart}>
          <em>by {user.displayName}</em>
        </span>
        <span className={globalClasses.cardTitleDatePart}>
          {dt.toFormat("MMM d")}
        </span>
      </Typography>
      {preview}
    </Paper>
  );
};
