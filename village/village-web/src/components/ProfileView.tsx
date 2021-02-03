import {
  CircularProgress,
  Divider,
  Typography,
  makeStyles,
} from "@material-ui/core";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import * as log from "loglevel";
import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Redirect, useHistory, useParams } from "react-router-dom";
import {
  coalesceMaybeToLoadableRecord,
  useLoadableRecord,
} from "../hooks/useLoadableRecord";
import { profileURL } from "../routing/URLs";
import { useWhitelistedUserFromAppAuthContext } from "../services/auth/AppAuth";
import { GetUserPostsFn, PostRecord } from "../services/store/Posts";
import { GetUserByUsernameFn, UserRecord } from "../services/store/Users";
import { useGlobalStyles } from "../styles/styles";
import { ProfilePostCard } from "./ProfilePostCard";

const useStyles = makeStyles(() => ({
  root: {},
  inline: {
    display: "inline",
  },
  profileDivider: {
    margin: "10px 0 0 0",
  },
}));

const listKeyForPost = (post: PostRecord) => `${post.id!}`;

type ProfileViewParams = {
  username: string;
};

export type ProfileViewProps = {
  posts: PostRecord[];
  user: UserRecord;
};

const useProfileState = (
  getUserPosts: GetUserPostsFn,
  getUserByUsername: GetUserByUsernameFn,
  username: string
) => {
  const [userRecord, setUserRecord] = useLoadableRecord<UserRecord>();
  const [postsRecord, setPostsRecord] = useLoadableRecord<PostRecord[]>();
  const history = useHistory();

  useEffect(() => {
    let isSubscribed = true;
    const loadUserRecord = async () => {
      const result = coalesceMaybeToLoadableRecord(
        await getUserByUsername(username)
      );
      if (!isSubscribed) {
        return;
      }
      if (result[0] !== null) {
        // replace URL with normalized URL, in case we got here through the
        // default /profile URL which goes to the viewer's own profile
        history.replace(profileURL(result[0].username));
      }
      setUserRecord(...result);
    };
    loadUserRecord();
    return () => {
      isSubscribed = false;
    };
  }, [getUserByUsername, history, setUserRecord, username]);

  useEffect(() => {
    let isSubscribed = true;
    const loadPostsRecord = async () => {
      if (!userRecord.loaded() || !userRecord.exists()) {
        return;
      }
      const userId = userRecord.get().uid;
      const result = await getUserPosts(userId);
      if (!isSubscribed) {
        return;
      }
      setPostsRecord(result, "exists");
    };
    loadPostsRecord();
    return () => {
      isSubscribed = false;
    };
  }, [getUserPosts, setPostsRecord, userRecord]);

  return {
    user: userRecord,
    posts: postsRecord,
  };
};

export const DefaultProfileViewController = (props: {}) => {
  const viewer = useWhitelistedUserFromAppAuthContext();
  return <Redirect to={!!viewer ? profileURL(viewer.username) : "/404"} />;
};

export const ProfileViewController = (props: {
  getUserPosts: GetUserPostsFn;
  getUserByUsername: GetUserByUsernameFn;
}) => {
  const globalClasses = useGlobalStyles();
  const logger = log.getLogger("ProfileView");

  const { getUserPosts, getUserByUsername } = props;
  const { username } = useParams<ProfileViewParams>();

  const { user, posts } = useProfileState(
    getUserPosts,
    getUserByUsername,
    username
  );

  const progressIndicator = (
    <CircularProgress className={globalClasses.loadingIndicator} />
  );
  const onUserNotFound = () => {
    logger.info(`User ${username} not found`);
    return <Redirect to={"/404"} />;
  };

  if (!user.loaded()) {
    return progressIndicator;
  } else if (!user.exists()) {
    return onUserNotFound();
  } else if (!posts.loaded()) {
    return progressIndicator;
  } else if (!posts.exists()) {
    return onUserNotFound();
  }

  return <ProfileView posts={posts.get()} user={user.get()} />;
};

export const ProfileView = (props: ProfileViewProps) => {
  const { posts, user } = props;
  const classes = useStyles();
  const globalClasses = useGlobalStyles();

  const listItems = posts.map((post) => {
    return (
      <ListItem
        alignItems="flex-start"
        key={listKeyForPost(post)}
        className={globalClasses.cardListItem}
        disableGutters
      >
        <ProfilePostCard post={post} />
      </ListItem>
    );
  });

  return (
    <>
      <Helmet>
        <title>{user.username}</title>
      </Helmet>
      <>
        <Typography variant="h1">{user.displayName}</Typography>
        <Typography variant="h5">{user.description}</Typography>
        <Divider className={classes.profileDivider} />
        <List className={classes.root}>{listItems}</List>
      </>
    </>
  );
};
