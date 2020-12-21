import * as log from "loglevel";
import React, { useState, useContext } from "react";
import { Container, Typography } from "@material-ui/core";
import { AuthContext } from "../services/auth/Auth";
import { UserPost, Source } from "../services/VillageController";
import Divider from "@material-ui/core/Divider";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

const useStyles = makeStyles((theme) => ({
  root: {},
  inline: {
    display: "inline",
  },
  profileDivider: {
    margin: "10px 0 0 0",
  },
}));

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
    return (
      <ListItem alignItems="flex-start">
        <ListItemText
          primary={post.post.title}
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
