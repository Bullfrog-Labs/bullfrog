import * as log from "loglevel";
import React, { useState, useContext, useEffect } from "react";
import {
  Avatar,
  Container,
  ListItemAvatar,
  Typography,
} from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ImageIcon from "@material-ui/icons/Image";
import { Link, useParams } from "react-router-dom";
import { UserPost, GetStackPostsFn } from "../services/store/Posts";
import { richTextStringPreview } from "./richtext/Utils";
import { useGlobalStyles } from "../styles/styles";

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
  username: {
    fontWeight: 300,
    color: "grey",
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
  const globalClasses = useGlobalStyles();

  const listItems = posts.map((post) => {
    const listItemPrimaryText = (
      <>
        <Typography variant="h6">
          <Link
            className={globalClasses.link}
            to={`/post/${post.user.uid}/${post.post.id}`}
          >
            {post.post.title}
          </Link>
        </Typography>
        <Typography variant="subtitle2" className={classes.username}>
          <em>{post.user.displayName}</em>
        </Typography>
      </>
    );
    return (
      <ListItem
        alignItems="flex-start"
        key={post.post.id}
        className={classes.postListItem}
      >
        <ListItemAvatar>
          <Avatar alt={post.user.displayName}>
            <ImageIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={listItemPrimaryText}
          secondary={
            <React.Fragment>
              {richTextStringPreview(post.post.body)}
            </React.Fragment>
          }
        />
      </ListItem>
    );
  });

  return (
    <Container maxWidth="sm">
      <Typography variant="h1">{source.name}</Typography>
      <Divider className={classes.profileDivider} />
      <List className={classes.root}>{listItems}</List>
    </Container>
  );
};
