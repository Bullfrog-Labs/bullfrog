import {
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@material-ui/core";
import CallReceivedIcon from "@material-ui/icons/CallReceived";
import DeleteIcon from "@material-ui/icons/Delete";
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import * as log from "loglevel";
import { DateTime } from "luxon";
import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { profileURL } from "../routing/URLs";
import { useWhitelistedUserFromAppAuthContext } from "../services/auth/AppAuth";
import { DeletePostFn } from "../services/store/Posts";
import { UserRecord } from "../services/store/Users";
import { LogEventFn } from "../services/Analytics";
import { useGlobalStyles } from "../styles/styles";

const useStyles = makeStyles((theme) => ({
  subtitlePart: {
    marginLeft: theme.spacing(1.5),
  },
  subtitleMoreMenuItem: {
    color: "rgba(0, 0, 0, 0.54)",
  },
  subtitleMoreMenuItemText: {
    color: "rgba(0, 0, 0, 0.54)",
    paddingLeft: theme.spacing(1),
  },
}));

export type PostSubtitleRowProps = {
  author: UserRecord;
  postTitle: string;
  postId: string;
  updatedAt: Date | undefined;
  numMentions: number;
  deletePost?: DeletePostFn;
  logEvent?: LogEventFn;
};

export const PostSubtitleRow = React.memo((props: PostSubtitleRowProps) => {
  const globalClasses = useGlobalStyles();
  const classes = useStyles();
  const logger = log.getLogger("PostSubtitleRow");
  const {
    deletePost,
    postId,
    author,
    updatedAt,
    postTitle,
    numMentions,
    logEvent = (eventName: string, parameters?: Object) => {},
  } = props;
  const dt = DateTime.fromJSDate(updatedAt || new Date());
  const stackURLPath = `/stack/${encodeURIComponent(postTitle)}`;
  const postHasMentions = numMentions;

  const whitelistedUser = useWhitelistedUserFromAppAuthContext();
  const isLoggedInAsAuthor = !!whitelistedUser
    ? author.uid === whitelistedUser.uid
    : false;

  if (isLoggedInAsAuthor && !deletePost) {
    throw new Error("Must provide deletePost when logged in as author");
  }

  const history = useHistory();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = (deletePost: DeletePostFn) => async (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>
  ) => {
    handleClose();
    await deletePost(author.uid, postId);
    logger.debug(`Post ${postId} deleted!`);
    logEvent("delete_post", {
      title: postTitle,
      author: author,
    });

    if (history.length > 2) {
      console.log(`${history.length}`);
      history.goBack();
    } else {
      history.push("/profile");
    }
  };

  return (
    <Typography
      variant="body1"
      className={globalClasses.postSubtitle}
      paragraph={false}
      component="div"
    >
      <div>
        <Link
          className={globalClasses.link}
          to={profileURL(author.username)}
          onClick={() =>
            logEvent("open_profile_from_post", {
              title: postTitle,
              author: author,
            })
          }
        >
          <em>{author.displayName}</em>
        </Link>
        <span className={classes.subtitlePart}>{dt.toFormat("MMM d")}</span>
        <span className={classes.subtitlePart}>
          <Tooltip title="See what others are saying about this topic">
            <Link
              className={globalClasses.link}
              to={stackURLPath}
              onClick={() =>
                logEvent("open_stack_from_post", {
                  title: postTitle,
                  author: author,
                })
              }
            >
              <IconButton size="small" style={{ marginLeft: "-3px" }}>
                <LibraryBooksIcon fontSize={"inherit"} />
              </IconButton>
            </Link>
          </Tooltip>
          <Tooltip title="Jump to mentions">
            <HashLink
              smooth
              className={globalClasses.link}
              to={`#mentions`}
              onClick={() =>
                logEvent("jump_to_mentions", {
                  title: postTitle,
                  author: author,
                })
              }
            >
              <IconButton
                size="small"
                style={{ marginLeft: "-3px" }}
                disabled={!postHasMentions}
              >
                <CallReceivedIcon fontSize={"inherit"} />
              </IconButton>
            </HashLink>
          </Tooltip>
          {isLoggedInAsAuthor && (
            <React.Fragment>
              <Tooltip title="Delete, settings, and more...">
                <IconButton
                  size="small"
                  style={{ marginLeft: "-3px" }}
                  onClick={handleClick}
                >
                  <MoreHorizIcon fontSize={"inherit"} />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem dense onClick={handleDelete(deletePost!)}>
                  <DeleteIcon
                    fontSize="small"
                    className={classes.subtitleMoreMenuItem}
                  />
                  <span className={classes.subtitleMoreMenuItemText}>
                    Delete
                  </span>
                </MenuItem>
              </Menu>
            </React.Fragment>
          )}
        </span>
      </div>
    </Typography>
  );
});
