import * as log from "loglevel";
import React, { useState, useEffect } from "react";
import { Container, Typography } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import { makeStyles } from "@material-ui/core";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { useParams } from "react-router-dom";
import { UserPost, GetStackPostsFn } from "../services/store/Posts";
import { useGlobalStyles } from "../styles/styles";
import { Helmet } from "react-helmet";
import { StackPostCard } from "./StackPostCard";

const useStyles = makeStyles(() => ({
  root: {},
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
  const { stackId } = useParams<StackViewParams>();
  const title = decodeURIComponent(stackId);
  logger.debug(`loading stack for ${title}`);
  const { getStackPosts } = props;
  const state = useStackState(getStackPosts, title);

  return <StackView posts={state.posts} source={{ name: title }} />;
};

export const StackView = (props: StackViewProps) => {
  const { posts, source } = props;
  const classes = useStyles();
  const globalClasses = useGlobalStyles();

  const listItems = posts.map((post) => {
    return (
      <ListItem
        alignItems="flex-start"
        key={post.post.id}
        className={globalClasses.cardListItem}
        disableGutters
      >
        <StackPostCard userPost={post} />
      </ListItem>
    );
  });

  return (
    <>
      <Helmet>
        <title>Stack for {source.name}</title>
      </Helmet>
      <Container maxWidth="sm">
        <Typography variant="h1">{source.name}</Typography>
        <Divider className={classes.profileDivider} />
        <List className={classes.root}>{listItems}</List>
      </Container>
    </>
  );
};
