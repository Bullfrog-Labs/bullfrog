import * as log from "loglevel";
import React, { useState, useContext } from "react";
import {
  Avatar,
  Container,
  ListItemAvatar,
  Typography,
} from "@material-ui/core";
import { AuthContext } from "../services/auth/Auth";
import Divider from "@material-ui/core/Divider";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ImageIcon from "@material-ui/icons/Image";
import { Link } from "react-router-dom";
import { UserPost } from "../services/store/Posts";

const useStyles = makeStyles((theme) => ({
  root: {},
  inline: {
    display: "inline",
  },
  profileDivider: {
    margin: "10px 0 0 0",
  },
}));

export interface Source {
  name: string;
}

export function useStackState(sourceName: string) {
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [source, setSource] = useState<Source>({ name: sourceName });
  return { posts: posts, source: source };
}

export function StackViewController() {
  const logger = log.getLogger("StackViewController");
  const authState = useContext(AuthContext);
  const state = useStackState(
    "Digital gardens let you cultivate your own little bit of the internet"
  );

  return <StackView posts={state.posts} source={state.source} />;
}

export function StackView(props: { posts: UserPost[]; source: Source }) {
  const logger = log.getLogger("StackView");
  const { posts, source } = props;
  const classes = useStyles();

  const listItems = posts.map((post) => {
    const linkTo = `/profile/${post.user.uid}`;
    const listItemPrimaryText = (
      <Typography variant="body2">
        {post.post.title} -{" "}
        <em>
          <Link to={linkTo}>{post.user.username}</Link>
        </em>
      </Typography>
    );
    return (
      <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <Avatar alt={post.user.displayName}>
            <ImageIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={listItemPrimaryText}
          secondary={<React.Fragment>{post.post.body}</React.Fragment>}
        />
      </ListItem>
    );
  });

  return (
    <Container maxWidth="sm">
      <Typography variant="h4">{source.name}</Typography>
      <Divider className={classes.profileDivider} />
      <List className={classes.root}>{listItems}</List>
    </Container>
  );
}
