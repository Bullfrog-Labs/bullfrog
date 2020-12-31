import React, { useEffect, useRef, useState } from "react";
import RichTextEditor, {
  RichTextEditorImperativeHandle,
} from "../components/richtext/RichTextEditor";
import * as log from "loglevel";
import {
  Container,
  CircularProgress,
  makeStyles,
  Paper,
  Grid,
} from "@material-ui/core";
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
import DocumentTitle from "../components/richtext/DocumentTitle";
import { EMPTY_RICH_TEXT } from "../components/richtext/Utils";
import { PostAuthorLink } from "../components/identity/PostAuthorLink";

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

const EMPTY_TITLE = "";

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

  const readOnly = props.readOnly || props.readOnly === undefined; // default to read-only

  if (readOnly) {
    logger.info(`rendering read-only view for ${props.title}`);
  }

  const richTextEditorRef = useRef<RichTextEditorImperativeHandle>(null);

  const idleTimer = (
    <IdleTimer
      timeout={props.idleTime ?? DEFAULT_IDLE_TIME}
      onIdle={props.onIdle}
    />
  );

  const documentTitle = (
    <DocumentTitle
      readOnly={readOnly}
      handleEscape={() => {
        richTextEditorRef.current?.focusEditor();
      }}
      value={props.title}
      onChange={props.onTitleChange}
    />
  );

  const richTextEditor = (
    <RichTextEditor
      ref={richTextEditorRef}
      readOnly={readOnly}
      body={props.body}
      onChange={props.onBodyChange}
      enableToolbar={false}
    />
  );

  const authorLink = <PostAuthorLink />;

  const paperElevation = readOnly ? 0 : 1;

  return (
    <Container className={classes.postView} maxWidth="md">
      <Paper elevation={paperElevation}>
        <Container>
          {idleTimer}
          <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="stretch"
            spacing={3}
          >
            <Grid item>{documentTitle}</Grid>
            <Grid item>{authorLink}</Grid>
            <Grid item>{richTextEditor}</Grid>
          </Grid>
        </Container>
      </Paper>
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
    !!props.prepopulatedTitle ? props.prepopulatedTitle : EMPTY_TITLE
  );

  const [nonEmptyBody, setNonEmptyBody] = useState(false);
  const [body, setBody] = useState<PostBody>(EMPTY_RICH_TEXT);

  const onIdle = async () => {
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
    setNonEmptyTitle(newTitle !== EMPTY_TITLE);
  };
  const onBodyChange = (newBody: PostBody) => {
    setBody(newBody);
    setNonEmptyBody(newBody !== EMPTY_RICH_TEXT);
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

  const onIdle = async () => {
    // TODO: Post should only be renamed if the user is idle and focus is not on
    // the title itself.
    // TODO: If the title is set to empty or blank, the title is reset back to the
    // original title. If the original title is shorter than the title, a crash
    // occurs because of the cursor position. Need to set the cursor to the
    // beginning of the title.
    const needsPostRename = titleChanged;

    // sync body first
    if (bodyChanged) {
      logger.debug("Body changed, syncing body");
      const syncBodyResult: SyncBodyResult = await syncBody(postId, body);

      if (syncBodyResult === "success") {
        logger.debug("Body synced");
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

      switch (renamePostResult.state) {
        case "success":
          // TODO: Display something to show the user that the rename succeeded
          logger.info(`Post renamed to ${title}`);
          setTitleChanged(false);
          setTitle(title);
          break;
        case "post-name-taken":
          const savedTitle = await props.getTitle();
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

          break;
        default:
          assertNever(renamePostResult);
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

  return (
    <BasePostView
      onIdle={onIdle}
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
  renamePost: RenamePostFn;
  syncBody: SyncBodyFn;
};

type PostViewControllerParams = {
  authorId: UserId;
  postId: PostId;
};

export const PostViewController = (props: PostViewControllerProps) => {
  const styles = useStyles();

  const { authorId, postId } = useParams<PostViewControllerParams>();
  const readOnly = props.user.uid !== authorId;
  const [postRecord, setPostRecord] = useState<PostRecord | undefined>(
    undefined
  );
  const [postRecordLoaded, setPostRecordLoaded] = useState(false);

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

  return (
    <PostView
      readOnly={readOnly}
      postRecord={postRecord}
      getTitle={getTitle}
      renamePost={props.renamePost}
      syncBody={props.syncBody}
    />
  );
};
