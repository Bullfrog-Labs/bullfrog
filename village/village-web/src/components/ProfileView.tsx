import * as log from "loglevel";
import React, { useContext, useState, useEffect } from "react";
import { Container, Typography } from "@material-ui/core";
import { AuthContext } from "../services/auth/Auth";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { PostRecord, GetUserPostsFn } from "../services/store/Posts";
import { UserRecord, UserId } from "../services/store/Users";

const useStyles = makeStyles((theme) => ({
  root: {},
  inline: {
    display: "inline",
  },
  profileDivider: {
    margin: "10px 0 0 0",
  },
}));

export const useProfileState = (
  getUserPosts: GetUserPostsFn,
  userId: UserId
) => {
  const [posts, setPosts] = useState<PostRecord[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const userPosts = await getUserPosts(userId);
      setPosts(userPosts);
    };
    fetchPosts();
  }, [getUserPosts, userId]);

  return {
    posts: posts,
    addPost: (post: PostRecord) => {},
  };
};

export const ProfileViewController = (props: {
  getUserPosts: GetUserPostsFn;
  user: UserRecord;
}) => {
  const { getUserPosts, user } = props;
  const authState = useContext(AuthContext);
  const state = useProfileState(getUserPosts, authState.uid);
  return <ProfileView posts={state.posts} user={user} />;
};

export const ProfileView = (props: {
  posts: PostRecord[];
  user: UserRecord;
}) => {
  const logger = log.getLogger("ProfileView");
  const classes = useStyles();
  const { posts, user } = props;

  const listItems = posts.map((post) => {
    return (
      <ListItem alignItems="flex-start" key={user.uid}>
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
      <Typography variant="body1">{user.description}</Typography>
      <Divider className={classes.profileDivider} />
      <List className={classes.root}>{listItems}</List>
    </Container>
  );
};
