import * as log from "loglevel";
import React, { useState, useContext, useEffect } from "react";
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
import { Link, useParams } from "react-router-dom";
import { UserPost, GetStackPostsFn } from "../services/store/Posts";

const useStyles = makeStyles((theme) => ({
  root: {},
  inline: {
    display: "inline",
  },
  profileDivider: {
    margin: "10px 0 0 0",
  },
}));

type StackViewParams = {
  stackId: string;
};

export type StackViewProps = {
  posts: UserPost[];
  source: Source;
};

export interface Source {
  name: string;
}

export const useStackState = (
  getStackPosts: GetStackPostsFn,
  title: string
) => {
  const [posts, setPosts] = useState<UserPost[]>([]);
  useEffect(() => {
    const fetchPosts = async () => {
      const userPosts = await getStackPosts(title);
      setPosts(userPosts);
    };
    fetchPosts();
  }, [getStackPosts, title]);
  return { posts: posts };
};

export const StackViewController = (props: {
  getStackPosts: GetStackPostsFn;
}) => {
  const logger = log.getLogger("StackViewController");
  const authState = useContext(AuthContext);
  const { stackId } = useParams<StackViewParams>();
  logger.debug(`loading stack for ${stackId}`);
  const { getStackPosts } = props;
  const state = useStackState(getStackPosts, stackId);

  return <StackView posts={state.posts} source={{ name: stackId }} />;
};

export const StackView = (props: StackViewProps) => {
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
      <ListItem alignItems="flex-start" key={post.post.id}>
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
};
