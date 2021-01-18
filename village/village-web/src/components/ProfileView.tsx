import * as log from "loglevel";
import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../services/auth/Auth";
import { Typography, Divider, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { PostRecord, GetUserPostsFn } from "../services/store/Posts";
import { UserRecord, UserId, GetUserFn } from "../services/store/Users";
import { Link, useParams, useHistory } from "react-router-dom";
import { useGlobalStyles } from "../styles/styles";
import { postURL } from "../routing/URLs";
import { richTextStringPreview } from "./richtext/Utils";
import { DateTime } from "luxon";

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
  card: {
    "&:hover": {
      backgroundColor: "#fafafa",
    },
    border: "0px",
    width: "100%",
  },
  datePart: {
    color: theme.palette.grey[600],
    paddingLeft: "8px",
    display: "inline",
  },
  emptyMentionsLine: {
    fontWeight: 200,
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
  const globalClasses = useGlobalStyles();
  const history = useHistory();
  const { posts, user } = props;

  const listKeyForPost = (post: PostRecord) => `${user.uid}/${post.id!}`;

  const listItems = posts.map((post) => {
    console.log(post.updatedAt);
    const dt = DateTime.fromJSDate(post.updatedAt || new Date());
    console.log(dt);
    const preview = richTextStringPreview(post.body);
    return (
      <ListItem
        alignItems="flex-start"
        key={listKeyForPost(post)}
        className={classes.postListItem}
      >
        <Paper
          className={classes.card}
          elevation={0}
          onClick={() => {
            history.push(postURL(post.authorId, post.id!));
          }}
        >
          <Typography
            variant="body1"
            style={{ fontWeight: "bold", display: "inline" }}
            gutterBottom
          >
            <Link
              className={globalClasses.link}
              key={listKeyForPost(post)}
              to={postURL(post.authorId, post.id!)}
              style={{ display: "inline" }}
            >
              {post.title}
            </Link>
            <span className={classes.datePart}>{dt.toFormat("MMM d")}</span>
          </Typography>
          {preview ? (
            <>
              <Typography paragraph={false} variant="body1">
                {preview}
              </Typography>
              <Typography paragraph={false} variant="body1">
                <em>⋯</em>
              </Typography>
            </>
          ) : (
            <Typography
              paragraph={false}
              variant="body2"
              className={classes.emptyMentionsLine}
            >
              <em>No content</em>
            </Typography>
          )}
        </Paper>
      </ListItem>
    );
  });

  return (
    <>
      <Typography variant="h1">{user.displayName}</Typography>
      <Typography variant="h5">{user.description}</Typography>
      <Divider className={classes.profileDivider} />
      <List className={classes.root}>{listItems}</List>
    </>
  );
};
