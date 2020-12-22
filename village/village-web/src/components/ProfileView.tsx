import * as log from "loglevel";
import React, { useContext, useState, useEffect } from "react";
import { Container, Typography } from "@material-ui/core";
import { AuthContext } from "../services/auth/Auth";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { posts0, user0 } from "../services/VillageController";
import { PostRecord } from "../services/store/Posts";
import { UserRecord } from "../services/store/Users";

const useStyles = makeStyles((theme) => ({
  root: {},
  inline: {
    display: "inline",
  },
  profileDivider: {
    margin: "10px 0 0 0",
  },
}));

export function useProfileState() {
  const [posts, setPosts] = useState<PostRecord[]>(posts0);
  const [user, setUser] = useState<UserRecord>(user0);

  useEffect(() => {}, []);

  return {
    posts: posts,
    user: user,
    addPost: (post: PostRecord) => {},
  };
}

export function ProfileViewController() {
  const state = useProfileState();
  const authState = useContext(AuthContext);
  return <ProfileView posts={state.posts} user={state.user} />;
}

export function ProfileView(props: { posts: PostRecord[]; user: UserRecord }) {
  const logger = log.getLogger("ProfileView");
  const classes = useStyles();
  const { posts, user } = props;

  const listItems = posts.map((post) => {
    return (
      <ListItem alignItems="flex-start">
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
}
