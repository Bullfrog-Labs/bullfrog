import {
  Grid,
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
import { useIsLoggedInAsAuthor } from "../hooks/posts/useIsLoggedInAsAuthor";
import { profileURL } from "../routing/URLs";
import { LogEventFn } from "../services/Analytics";
import { useWhitelistedUserFromAppAuthContext } from "../services/auth/AppAuth";
import { FollowablePostViewState } from "../services/follows/Types";
import { DeletePostFn } from "../services/store/Posts";
import { UserRecord } from "../services/store/Users";
import { useGlobalStyles } from "../styles/styles";
import { FollowButton } from "./follows/FollowButton";

const useStyles = makeStyles((theme) => ({
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

  followablePostViewState: FollowablePostViewState;
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
    followablePostViewState,
  } = props;
  const dt = DateTime.fromJSDate(updatedAt || new Date());
  const stackURLPath = `/stack/${encodeURIComponent(postTitle)}`;
  const postHasMentions = numMentions;

  const isLoggedInAsAuthor = useIsLoggedInAsAuthor(author.uid);

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
    history.push("/profile");
  };

  const viewer = useWhitelistedUserFromAppAuthContext();

  return (
    <Grid
      container
      direction="column"
      justify="flex-start"
      alignItems="stretch"
    >
      {followablePostViewState.followCount > 0 && (
        <Grid item>
          <Typography
            variant="body1"
            className={globalClasses.postSubtitle}
            paragraph={false}
            component="div"
          >
            {followablePostViewState.followCount} follows
          </Typography>
        </Grid>
      )}
      <Grid item>
        <Grid container alignItems="center" spacing={5}>
          <Grid item>
            <Grid
              container
              justify="flex-start"
              alignItems="center"
              spacing={1}
            >
              <Grid item>
                <Typography
                  variant="body1"
                  className={globalClasses.postSubtitle}
                  paragraph={false}
                  component="div"
                >
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
                </Typography>
              </Grid>

              <Grid item>
                <Typography
                  variant="body1"
                  className={globalClasses.postSubtitle}
                  paragraph={false}
                  component="div"
                >
                  {dt.toFormat("MMM d")}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item>
            <Grid container justify="flex-end" alignItems="center">
              {followablePostViewState.isFollowableByViewer && (
                <Grid item>
                  <FollowButton
                    isFollowed={followablePostViewState.isFollowedByViewer!}
                    tooltip={{
                      followed: "Unfollow this post",
                      notFollowed: "Follow to get updates on this post",
                    }}
                    onClick={async (isFollowed) => {
                      logEvent(!isFollowed ? "follow_post" : "unfollow_post", {
                        title: postTitle,
                        author: author,
                        follower: viewer!,
                      });
                      await followablePostViewState.setFollowed!(
                        author.uid,
                        postId,
                        !isFollowed
                      );
                    }}
                  />
                </Grid>
              )}

              <Grid item>
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
              </Grid>

              <Grid item>
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
              </Grid>

              {isLoggedInAsAuthor && (
                <Grid item>
                  <>
                    <Tooltip title="Delete, settings, and more...">
                      <IconButton size="small" onClick={handleClick}>
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
                  </>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
});

/*
 
        <Typography
          variant="body1"
          className={globalClasses.postSubtitle}
          paragraph={false}
          component="div"
        >
          <div>
            <span className={classes.subtitlePart}>
           </span>
          </div>
        </Typography>
        */
