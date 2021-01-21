import * as log from "loglevel";
import React, { useEffect } from "react";
import { Typography, Divider, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { PostRecord, GetUserPostsFn } from "../services/store/Posts";
import { UserRecord, GetUserByUsernameFn } from "../services/store/Users";
import { Redirect, useHistory, useParams } from "react-router-dom";
import { ProfilePostCard } from "./ProfilePostCard";
import { useGlobalStyles } from "../styles/styles";
import { Helmet } from "react-helmet";
import {
  coalesceMaybeToLoadableRecord,
  useLoadableRecord,
} from "../hooks/useLoadableRecord";
import { profileURL } from "../routing/URLs";

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

export const ProfileViewController = (props: {
  getUserPosts: GetUserPostsFn;
  getUserByUsername: GetUserByUsernameFn;
  viewer: UserRecord;
}) => {
  const globalClasses = useGlobalStyles();
  const logger = log.getLogger("ProfileView");

  const { getUserPosts, getUserByUsername, viewer } = props;
  const { username } = useParams<ProfileViewParams>();
  const profileViewUsername = username || viewer.username;

  const { user, posts } = useProfileState(
    getUserPosts,
    getUserByUsername,
    profileViewUsername
  );

  const progressIndicator = (
    <CircularProgress className={globalClasses.loadingIndicator} />
  );
  const onUserNotFound = () => {
    logger.info(`User ${profileViewUsername} not found`);
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
