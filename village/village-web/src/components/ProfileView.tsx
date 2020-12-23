import * as log from "loglevel";
import React, { useContext, useState, useEffect } from "react";
import { Container, Typography } from "@material-ui/core";
import { AuthContext } from "../services/auth/Auth";
import Divider from "@material-ui/core/Divider";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { PostRecord, GetUserPostsFn } from "../services/store/Posts";
import { UserRecord, UserId, GetUserFn } from "../services/store/Users";
import { useParams } from "react-router-dom";
import ListItemText from "@material-ui/core/ListItemText";

const useStyles = makeStyles((theme) => ({
  root: {},
  inline: {
    display: "inline",
  },
  profileDivider: {
    margin: "10px 0 0 0",
  },
  postListItem: {
    paddingLeft: "0px",
    paddingRight: "0px",
  },
  postCard: {
    width: "100%",
  },
}));

type ProfileViewParams = {
  userId: string;
};

export type ProfileViewProps = {
  posts: PostRecord[];
  user: UserRecord;
};

export const useProfileState = (
  getUserPosts: GetUserPostsFn,
  getUser: GetUserFn,
  userId: UserId
) => {
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
    addPost: (post: PostRecord) => {},
  };
};

export const ProfileViewController = (props: {
  getUserPosts: GetUserPostsFn;
  getUser: GetUserFn;
  user: UserRecord;
}) => {
  const { getUserPosts, getUser, user } = props;
  const authState = useContext(AuthContext);
  const { userId } = useParams<ProfileViewParams>();
  const profileViewUserId = userId || authState.uid;
  const state = useProfileState(getUserPosts, getUser, profileViewUserId);
  if (state && state.user && state.posts) {
    return <ProfileView posts={state.posts} user={state.user} />;
  } else {
    return <React.Fragment />;
  }
};

export const ProfileView = (props: ProfileViewProps) => {
  const logger = log.getLogger("ProfileView");
  const classes = useStyles();
  const { posts, user } = props;

  const listItems = posts.map((post) => {
    return (
      <ListItem
        alignItems="flex-start"
        key={user.uid}
        className={classes.postListItem}
      >
        <ListItemText
          primary={post.title}
          secondary={<React.Fragment>{post.body}</React.Fragment>}
        />
      </ListItem>
    );
  });

  return (
    <Container maxWidth="sm">
      <Typography variant="h4">{user.displayName}</Typography>
      <Typography variant="h6">{user.description}</Typography>
      <Divider className={classes.profileDivider} />
      <List className={classes.root}>{listItems}</List>
    </Container>
  );
};
