import { Grid, makeStyles } from "@material-ui/core";
import LibraryAddCheckIcon from "@material-ui/icons/LibraryAddCheck";
import React from "react";
import { Link } from "react-router-dom";
import { postURLById, profileURL } from "../../routing/URLs";
import { Activity } from "../../services/activities/Types";
import { LogEventFn } from "../../services/Analytics";
import { useGlobalStyles } from "../../styles/styles";

const useStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(1),
    flexWrap: "nowrap",
  },
  icon: {
    [theme.breakpoints.down("sm")]: {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(3),
    },
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(3),
      marginRight: theme.spacing(9),
    },
  },
  body: {
    marginBottom: theme.spacing(1),
  },
}));

export type PostFollowNotificationProps = {
  activity: Activity;
  logEvent: LogEventFn;
};

export const PostFollowNotification = (props: PostFollowNotificationProps) => {
  const classes = useStyles();
  const globalClasses = useGlobalStyles();

  const { activity, logEvent } = props;
  const title = activity.content!.title;
  const follower = activity.content!.follower;
  const postId = activity.target.postId;
  const authorId = activity.target.authorId;

  const followedPostURL = postURLById(authorId, postId);
  const followerProfileURL = profileURL(follower.username);

  return (
    <Grid
      container
      direction="row"
      justify="flex-start"
      alignItems="center"
      className={classes.container}
    >
      <Grid item className={classes.icon}>
        <LibraryAddCheckIcon fontSize={"large"} />
      </Grid>
      <Grid item className={classes.body}>
        <Link
          className={globalClasses.link}
          to={followerProfileURL}
          onClick={() =>
            logEvent("open_profile_from_post_follow_notification", {
              title: title,
              postId: postId,
              follower: follower,
            })
          }
        >
          <em>{follower.username} </em>
        </Link>{" "}
        followed your post{" "}
        <Link
          className={globalClasses.link}
          to={followedPostURL}
          onClick={() =>
            logEvent("open_post_from_post_follow_notification", {
              title: title,
              postId: postId,
              follower: follower,
            })
          }
        >
          {title}
        </Link>
      </Grid>
    </Grid>
  );
};
