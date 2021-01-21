import React from "react";
import { Link } from "react-router-dom";
import { UserRecord } from "../services/store/Users";
import { useGlobalStyles } from "../styles/styles";
import { makeStyles, Typography, IconButton, Tooltip } from "@material-ui/core";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import CallReceivedIcon from "@material-ui/icons/CallReceived";
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";
import { DateTime } from "luxon";
import { HashLink } from "react-router-hash-link";

export type PostAuthorLinkProps = {
  viewer: UserRecord;
  author: UserRecord;
  postTitle: string;
  postId: string;
  updatedAt: Date | undefined;
};

const useStyles = makeStyles((theme) => ({
  subtitlePart: {
    marginLeft: theme.spacing(1.5),
  },
}));

export const PostSubtitleRow = (props: PostAuthorLinkProps) => {
  const globalClasses = useGlobalStyles();
  const classes = useStyles();
  const dt = DateTime.fromJSDate(props.updatedAt || new Date());
  const isLoggedIn = props.author.uid === props.viewer.uid;

  return (
    <Typography variant="body1" className={globalClasses.postSubtitle}>
      <div>
        <Link
          className={globalClasses.link}
          to={`/profile/${props.author.uid}`}
        >
          <em>{props.author.displayName}</em>
        </Link>
        <span className={classes.subtitlePart}>{dt.toFormat("MMM d")}</span>
        <span className={classes.subtitlePart}>
          <Tooltip title="View stack">
            <Link
              className={globalClasses.link}
              to={`/stack/${props.postTitle}`}
            >
              <IconButton size="small" style={{ marginLeft: "-3px" }}>
                <LibraryBooksIcon fontSize={"inherit"} />
              </IconButton>
            </Link>
          </Tooltip>
          <Tooltip title="View mentions">
            <HashLink smooth className={globalClasses.link} to={`#mentions`}>
              <IconButton size="small" style={{ marginLeft: "-3px" }}>
                <CallReceivedIcon fontSize={"inherit"} />
              </IconButton>
            </HashLink>
          </Tooltip>
          {isLoggedIn && (
            <Tooltip title="Delete, settings, and more...">
              <IconButton size="small" style={{ marginLeft: "-3px" }}>
                <MoreHorizIcon fontSize={"inherit"} />
              </IconButton>
            </Tooltip>
          )}
        </span>
      </div>
    </Typography>
  );
};
