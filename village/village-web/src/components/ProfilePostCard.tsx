import * as log from "loglevel";
import React from "react";
import { Typography, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { PostRecord } from "../services/store/Posts";
import { Link, useHistory } from "react-router-dom";
import { useGlobalStyles } from "../styles/styles";
import { postURL } from "../routing/URLs";
import { postPreview, isEmptyDoc } from "./richtext/Utils";
import { DateTime } from "luxon";
import { RichTextCompactViewer } from "../components/richtext/RichTextEditor";

const useStyles = makeStyles((theme) => ({
  root: {},
  postListItem: {
    paddingLeft: "0px",
    paddingRight: "0px",
  },
  card: {
    "&:hover": {
      backgroundColor: "#fafafa",
    },
    border: "0px",
    width: "100%",
  },
  datePart: {
    color: theme.palette.grey[600],
    paddingLeft: "8px",
    display: "inline",
  },
  emptyMentionsLine: {
    fontWeight: 200,
  },
}));

const listKeyForPost = (post: PostRecord) => `${post.id!}`;

export const ProfilePostCard = (props: { post: PostRecord }) => {
  const classes = useStyles();
  const globalClasses = useGlobalStyles();
  const history = useHistory();
  const { post } = props;
  const dt = DateTime.fromJSDate(post.updatedAt || new Date());
  let preview = undefined;
  if (!isEmptyDoc(post.body)) {
    const previewDoc = postPreview(post.body);
    preview = <RichTextCompactViewer body={previewDoc} />;
  }

  return (
    <Paper
      className={classes.card}
      elevation={0}
      onClick={() => {
        history.push(postURL(post.authorId, post.id!));
      }}
    >
      <Typography
        variant="body1"
        style={{ fontWeight: "bold", display: "inline" }}
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
        <span className={classes.datePart}>{dt.toFormat("MMM d")}</span>
      </Typography>
      {preview ? (
        <>
          <Typography paragraph={false} variant="body1">
            {preview}
          </Typography>
          <Typography paragraph={false} variant="body1">
            <em>⋯</em>
          </Typography>
        </>
      ) : (
        <Typography
          paragraph={false}
          variant="body2"
          className={classes.emptyMentionsLine}
        >
          <em>No content</em>
        </Typography>
      )}
    </Paper>
  );
};
