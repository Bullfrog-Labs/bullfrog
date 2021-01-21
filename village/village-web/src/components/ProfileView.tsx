import * as log from "loglevel";
import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../services/auth/Auth";
import { Typography, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { PostRecord, GetUserPostsFn } from "../services/store/Posts";
import {
  UserRecord,
  UserId,
  GetUserFn,
  GetUserByUsernameFn,
} from "../services/store/Users";
import { Link, useParams } from "react-router-dom";
import { richTextStringPreview } from "./richtext/Utils";
import ListItemText from "@material-ui/core/ListItemText";
import { ProfilePostCard } from "./ProfilePostCard";
import { useGlobalStyles } from "../styles/styles";
import { Helmet } from "react-helmet";
import {
  coalesceMaybeToLoadableRecord,
  useLoadableRecord,
} from "../hooks/useLoadableRecord";

const useStyles = makeStyles((theme) => ({
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
  // username: string;
  userId: string;
};

export type ProfileViewProps = {
  posts: PostRecord[];
  user: UserRecord;
};

const useProfileState = (
  getUserPosts: GetUserPostsFn,
  getUser: GetUserFn,
  userId: UserId
) => {
  // need to get user id to fetch posts. how to do that?

  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [user, setUser] = useState<UserRecord>();

  useEffect(() => {
    const fetchPosts = async () => {
      const userPosts = await getUserPosts(userId);
      setPosts(userPosts);
    };
    fetchPosts();
  }, [getUserPosts, userId]);

  useEffect(() => {
    const fetchUser = async () => {
      const profileUser = await getUser(userId);
      if (!profileUser) {
        throw new Error("Missing user for userId");
      }
      setUser(profileUser);
    };
    fetchUser();
  }, [getUserPosts, getUser, userId]);

  return {
    posts: posts,
    user: user,
  };
};

export const ProfileViewController = (props: {
  getUserPosts: GetUserPostsFn;
  getUser: GetUserFn;
  getUserByUsername: GetUserByUsernameFn;
  user: UserRecord;
}) => {
  const { getUserPosts, getUser, getUserByUsername, user } = props;
  const { userId } = useParams<ProfileViewParams>();
  const profileViewUserId = userId || user.uid;

  const state = useProfileState(getUserPosts, getUser, profileViewUserId);
  if (state && state.user && state.posts) {
    return <ProfileView posts={state.posts} user={state.user} />;
  } else {
    return <React.Fragment />;
  }
};

export const ProfileView = (props: ProfileViewProps) => {
  const logger = log.getLogger("ProfileView");
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
