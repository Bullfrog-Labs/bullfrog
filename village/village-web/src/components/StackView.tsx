import * as log from "loglevel";
import { useState, useContext } from "react";
import { Container } from "@material-ui/core";
import { AuthContext } from "../services/auth/Auth";
import { UserPost, Source } from "../services/VillageController";

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

  return (
    <Container maxWidth="md">
      <Typography variant="h4">{user.displayName}</Typography>
      <Typography variant="body1">{user.description}</Typography>
      <Divider className={classes.profileDivider} />
      <List className={classes.root}>{listItems}</List>
    </Container>
  );
}
