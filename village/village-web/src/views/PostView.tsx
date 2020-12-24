import React, { useEffect, useState } from "react";
import RichTextEditor, {
  EMPTY_RICH_TEXT_STATE,
} from "../components/richtext/RichTextEditor";
import * as log from "loglevel";
import { Container, CircularProgress, makeStyles } from "@material-ui/core";
import IdleTimer from "react-idle-timer";
import {
  PostRecord,
  PostId,
  RenamePostFn,
  RenamePostResult,
  SyncBodyFn,
  SyncBodyResult,
  CreatePostFn,
  PostBody,
  PostTitle,
} from "../services/store/Posts";
import { UserId, UserRecord } from "../services/store/Users";
import { Redirect, useHistory, useParams } from "react-router-dom";
import { assertNever } from "../utils";

const useStyles = makeStyles((theme) => ({
  postView: {
    "margin-top": theme.spacing(5),
  },
  loadingIndicator: {
    position: "fixed",
    top: "30%",
    left: "50%",
  },
}));

const DEFAULT_IDLE_TIME = 1 * 1000;

export type BasePostViewProps = {
  idleTime?: number;
  readOnly: boolean;

  title: PostTitle;
  body: PostBody;

  onTitleChange: (newTitle: PostTitle) => void;
  onBodyChange: (newBody: PostBody) => void;
  onIdle: (event: Event) => void;
};

export const BasePostView = (props: BasePostViewProps) => {
  const logger = log.getLogger("BasePostView");
  const classes = useStyles();

  if (props.readOnly) {
    logger.info(`rendering read-only view for ${props.title}`);

    return (
      <Container className={classes.postView} maxWidth="md">
        <RichTextEditor
          readOnly={true}
          title={props.title}
          onTitleChange={props.onTitleChange}
          body={props.body}
          onBodyChange={props.onBodyChange}
          enableToolbar={false}
        />
      </Container>
    );
  }

  return (
    <Container className={classes.postView} maxWidth="md">
      <IdleTimer
        timeout={props.idleTime ?? DEFAULT_IDLE_TIME}
        onIdle={props.onIdle}
      >
        <RichTextEditor
          readOnly={props.readOnly ?? false}
          title={props.title}
          onTitleChange={props.onTitleChange}
          body={props.body}
          onBodyChange={props.onBodyChange}
          enableToolbar={false}
        />
      </IdleTimer>
    </Container>
  );
};

export interface CreateNewPostViewProps {
  prepopulatedTitle?: PostTitle;
  createPost: CreatePostFn;
  redirectAfterCreate: (postUrl: string) => void;
}

export const CreateNewPostView = (props: CreateNewPostViewProps) => {
  // Need to be able to pre-populate title, or have empty title.
  // Note is not saved until it has a title and a body. Once the note is saved,
  // it is redirected to the post view.
  // Changing title of an unsaved note does nothing on the backend.
  // Save note on idle if the title or body is changed. No saving on blank
  // title.
  const logger = log.getLogger("CreateNewPostView");

  const [nonEmptyTitle, setNonEmptyTitle] = useState(!!props.prepopulatedTitle);
  const [title, setTitle] = useState<string>(
    !!props.prepopulatedTitle
      ? props.prepopulatedTitle
      : EMPTY_RICH_TEXT_STATE.title
  );

  const [nonEmptyBody, setNonEmptyBody] = useState(false);
  const [body, setBody] = useState<PostBody>(EMPTY_RICH_TEXT_STATE.body);

  const onIdle = async (event: Event) => {
    if (!nonEmptyTitle || !nonEmptyBody) {
      logger.debug("Title or body empty, not creating new post");
      return;
    }

    const createPostResult = await props.createPost(title, body);
    const { postId } = createPostResult;

    switch (createPostResult.state) {
      case "success":
        const { postUrl } = createPostResult;
        logger.info(
          `new post created with title ${title} and post id ${postId}, redirecting to ${postUrl}`
        );

        // do redirect to permanent note url
        props.redirectAfterCreate(postUrl);

        return;
      case "post-name-taken":
        logger.info(
          `new post creation with title ${title} failed because that post name is already taken by post with id ${postId}`
        );
        // TODO: Display something to show the user that the rename failed due
        // to the new name already being taken.
        return;
      default:
        assertNever(createPostResult);
    }
  };

  const onTitleChange = (newTitle: PostTitle) => {
    setTitle(newTitle);
    setNonEmptyTitle(newTitle !== EMPTY_RICH_TEXT_STATE.title);
  };
  const onBodyChange = (newBody: PostBody) => {
    setBody(newBody);
    setNonEmptyBody(newBody !== EMPTY_RICH_TEXT_STATE.body);
  };

  return (
    <BasePostView
      readOnly={false}
      title={title}
      body={body}
      onIdle={onIdle}
      onTitleChange={onTitleChange}
      onBodyChange={onBodyChange}
    />
  );
};

export type CreateNewPostViewControllerProps = {
  createPost: CreatePostFn;
};

export type CreateNewPostViewControllerParams = {
  prepopulatedTitle?: PostTitle;
};

export const CreateNewPostViewController = (
  props: CreateNewPostViewControllerProps
) => {
  const { prepopulatedTitle } = useParams<CreateNewPostViewControllerParams>();

  const history = useHistory();
  const redirectAfterCreate = (postUrl: string) => {
    history.replace(postUrl);
  };

  return (
    <CreateNewPostView
      prepopulatedTitle={prepopulatedTitle}
      createPost={props.createPost}
      redirectAfterCreate={redirectAfterCreate}
    />
  );
};

export type PostViewProps = {
  readOnly: boolean;
  postRecord: PostRecord;

  getTitle: () => Promise<PostTitle | undefined>;

  renamePost: RenamePostFn;
  syncBody: SyncBodyFn;
};

// TODO: Implement code to load the post data into the PostView
// Changing title triggers a rename. Renames are not allowed if the title is
// already being used.
export const PostView = (props: PostViewProps) => {
  const logger = log.getLogger("PostView");
  const { renamePost, syncBody, postRecord, ...restProps } = props;

  if (!postRecord.id) {
    throw new Error("PostRecord id should not be undefined in PostView");
  }

  const postId = postRecord.id;

  const [title, setTitle] = useState(postRecord.title);
  const [titleChanged, setTitleChanged] = useState(false);

  const [body, setBody] = useState(postRecord.body);
  const [bodyChanged, setBodyChanged] = useState(false);

  const onIdle = async (event: Event) => {
    // TODO: Post should only be renamed if the user is idle and focus is not on
    // the title itself.
    // TODO: If the title is set to empty or blank, reset it back to the
    // original title
    const needsPostRename = titleChanged;

    // sync body first
    if (bodyChanged) {
      logger.debug("Body changed, syncing body");
      const syncBodyResult: SyncBodyResult = await syncBody(postId, body);

      if (syncBodyResult === "success") {
        setBodyChanged(false);
      } else {
        logger.error("sync body failed, will try in next onIdle");
        needsPostRename &&
          logger.error("skipping post rename due to sync body failure");
        return;
      }
    }

    // rename post, if needed
    if (needsPostRename) {
      logger.debug("Title changed, renaming post");
      const renamePostResult: RenamePostResult = await renamePost(
        postId,
        title
      );

      if (renamePostResult === "success") {
        logger.info(`Post renamed to ${title}`);
        setTitleChanged(false);
        // TODO: Display something to show the user that the rename succeeded
      } else if (renamePostResult === "post-name-taken") {
        const savedTitle = await props.getTitle(); // this should be pulled from DB

        if (!savedTitle) {
          // No post was found, even though it was just being edited.
          // TODO: This should be handled properly at some point, e.g. attempt to
          // create the post again, or show an error message saying that the
          // note has been deleted.
          // For now it will just be logged, since this is a corner case.
          logger.info(
            "Post rename failed, post deleted while being renamed to already-taken post name"
          );
          return;
        }

        logger.info(
          `Post rename failed, ${title} already taken. Reverting to saved title ${savedTitle}`
        );

        setTitle(savedTitle);
        setTitleChanged(false);
        // TODO: Display something to show the user that the rename failed due
        // to the new name already being taken.
      } else {
        throw Error("Unknown return value from renamePost");
      }
    }
  };

  const onTitleChange = (newTitle: PostTitle) => {
    if (newTitle !== postRecord.title) {
      setTitle(newTitle);
      setTitleChanged(true);
    }
  };

  const onBodyChange = (newBody: PostBody) => {
    // TODO: Only mark body as changed if it is actually different
    setBody(newBody);
    setBodyChanged(true);
  };

  const onIdleNoop = (event: Event) => {};

  return (
    <BasePostView
      onIdle={onIdleNoop}
      title={title}
      body={body}
      onTitleChange={onTitleChange}
      onBodyChange={onBodyChange}
      {...restProps}
    />
  );
};

type PostViewControllerProps = {
  user: UserRecord;
  getPost: (uid: UserId, postId: PostId) => Promise<PostRecord | undefined>;
  /*
  renamePost: RenamePostFn;
  syncBody: SyncBodyFn;
  */
};

type PostViewControllerParams = {
  authorId: UserId;
  postId: PostId;
};

export const PostViewController = (props: PostViewControllerProps) => {
  // Determine whether read-only
  const styles = useStyles();

  const { authorId, postId } = useParams<PostViewControllerParams>();
  const readOnly = props.user.uid !== authorId;
  const [postRecord, setPostRecord] = useState<PostRecord | undefined>(
    undefined
  );
  const [postRecordLoaded, setPostRecordLoaded] = useState(false);

  // TODO: Remove the stringtoSlateNode. It is just a hack to get things to work
  // for now, since the post is just a plain text string in the mock data.

  // Attempt to load post
  // TODO: Encapsulate this in a use*-style hook
  useEffect(() => {
    const loadPostRecord = async () => {
      setPostRecord(await props.getPost(authorId, postId));
      setPostRecordLoaded(true);
    };
    loadPostRecord();
  }, [authorId, postId, props]);

  if (!postRecordLoaded) {
    return <CircularProgress className={styles.loadingIndicator} />;
  } else if (!postRecord) {
    // TODO: Is this the right place to redirect?
    return <Redirect to={"/404"} />;
  }

  // Define helpers
  const getTitle: () => Promise<PostTitle | undefined> = async () => {
    const postRecord = await props.getPost(authorId, postId);
    return postRecord ? postRecord.title : undefined;
  };

  const renamePost: RenamePostFn = async () => {
    return "success";
  };

  const syncBody: SyncBodyFn = async () => {
    return "success";
  };

  return (
    <PostView
      readOnly={readOnly}
      postRecord={postRecord}
      getTitle={getTitle}
      renamePost={renamePost}
      syncBody={syncBody}
    />
  );
};
