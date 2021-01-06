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
  Typography,
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
  GetGlobalMentionsFn,
} from "../services/store/Posts";
import { GetUserFn, UserId, UserRecord } from "../services/store/Users";
import { useMentions } from "../hooks/useMentions";
import { Redirect, useHistory, useParams } from "react-router-dom";
import { assertNever } from "../utils";
import { MentionNode, MentionNodeData } from "@blfrg.xyz/slate-plugins";
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

type EditablePostInputs = {
  idleTime?: number;
  onIdle: (event: Event) => void;

  readOnly: boolean;

  title: PostTitle;
  body: PostBody;

  onTitleChange: (newTitle: PostTitle) => void;
  onBodyChange: (newBody: PostBody) => void;

  onMentionSearchChanged: (newSearch: string) => void;
  mentionables: MentionNodeData[];
  onMentionAdded: (option: MentionNodeData) => void;
  mentionableElementFn: (option: MentionNodeData) => JSX.Element;
};

type EditablePostComponents = {
  idleTimer: React.ReactChild;
  documentTitle: React.ReactChild;
  richTextEditor: React.ReactChild;
};

const useEditablePostComponents: (
  inputs: EditablePostInputs
) => EditablePostComponents = ({
  idleTime,
  onIdle,
  readOnly,
  title,
  body,
  onTitleChange,
  onBodyChange,
  onMentionSearchChanged,
  mentionables,
  onMentionAdded,
  mentionableElementFn,
}) => {
  const richTextEditorRef = useRef<RichTextEditorImperativeHandle>(null);

  const idleTimer = (
    <IdleTimer timeout={idleTime ?? DEFAULT_IDLE_TIME} onIdle={onIdle} />
  );

  const documentTitle = (
    <DocumentTitle
      readOnly={readOnly}
      handleEscape={() => {
        richTextEditorRef.current?.focusEditor();
      }}
      value={title}
      onChange={onTitleChange}
    />
  );

  const richTextEditor = (
    <RichTextEditor
      ref={richTextEditorRef}
      readOnly={readOnly}
      body={body}
      onChange={onBodyChange}
      enableToolbar={false}
      mentionables={mentionables}
      onMentionSearchChanged={onMentionSearchChanged}
      onMentionAdded={onMentionAdded}
      mentionableElementFn={mentionableElementFn}
    />
  );

  const result: EditablePostComponents = {
    idleTimer: idleTimer,
    documentTitle: documentTitle,
    richTextEditor: richTextEditor,
  };

  return result;
};

export type BasePostViewProps = {
  readOnly: boolean;
  postView: React.ReactChild;
};

export const BasePostView = (props: BasePostViewProps) => {
  const classes = useStyles();
  const paperElevation = props.readOnly ? 0 : 1;

  return (
    <Container className={classes.postView} maxWidth="sm">
      <Paper elevation={paperElevation}>{props.postView}</Paper>
    </Container>
  );
};

export interface CreateNewPostViewProps {
  prepopulatedTitle?: PostTitle;
  createPost: CreatePostFn;
  redirectAfterCreate: (postUrl: string) => void;
  onMentionSearchChanged: (newSearch: string) => void;
  mentionables: MentionNodeData[];
  onMentionAdded: (option: MentionNodeData) => void;
  mentionableElementFn: (option: MentionNodeData) => JSX.Element;
  user: UserRecord;
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

  const readOnly = false;

  const {
    idleTimer,
    documentTitle,
    richTextEditor,
  } = useEditablePostComponents({
    onIdle: onIdle,
    readOnly: readOnly,

    title: title,
    body: body,

    onTitleChange: onTitleChange,
    onBodyChange: onBodyChange,

    onMentionSearchChanged: props.onMentionSearchChanged,
    mentionables: props.mentionables,
    onMentionAdded: props.onMentionAdded,
    mentionableElementFn: props.mentionableElementFn,
  });

  const postView = (
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
        <Grid item>{richTextEditor}</Grid>
      </Grid>
    </Container>
  );

  return <BasePostView readOnly={readOnly} postView={postView} />;
};

export type CreateNewPostViewControllerProps = {
  createPost: CreatePostFn;
  getGlobalMentions: GetGlobalMentionsFn;
  user: UserRecord;
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

  const [mentionables, onMentionSearchChanged, onMentionAdded] = useMentions(
    props.getGlobalMentions,
    props.createPost,
    props.user.uid
  );

  const mentionableElementFn = (option: MentionNodeData): JSX.Element => {
    if (option.authorId === props.user.uid) {
      return <Typography>{option.value}</Typography>;
    } else {
      return (
        <Typography>
          {option.value} - <em>{option.authorUsername}</em>
        </Typography>
      );
    }
  };

  return (
    <CreateNewPostView
      prepopulatedTitle={prepopulatedTitle}
      createPost={props.createPost}
      redirectAfterCreate={redirectAfterCreate}
      onMentionSearchChanged={onMentionSearchChanged}
      mentionables={mentionables}
      onMentionAdded={onMentionAdded}
      mentionableElementFn={mentionableElementFn}
      user={props.user}
    />
  );
};

export type PostViewProps = {
  readOnly: boolean;
  postRecord: PostRecord;

  viewer: UserRecord;
  author: UserRecord;

  getTitle: () => Promise<PostTitle | undefined>;

  renamePost: RenamePostFn;
  syncBody: SyncBodyFn;
  onMentionSearchChanged: (newSearch: string) => void;
  mentionables: MentionNodeData[];
  onMentionAdded: (option: MentionNodeData) => void;
  mentionableElementFn: (option: MentionNodeData) => JSX.Element;
};

// Changing title triggers a rename. Renames are not allowed if the title is
// already being used.
export const PostView = (props: PostViewProps) => {
  const logger = log.getLogger("PostView");

  if (!props.postRecord.id) {
    throw new Error("PostRecord id should not be undefined in PostView");
  }

  const readOnly = props.readOnly || props.readOnly === undefined; // default to read-only

  if (readOnly) {
    logger.info(`rendering read-only view for ${props.postRecord.title}`);
  }

  const postId = props.postRecord.id;

  const [title, setTitle] = useState(props.postRecord.title);
  const [titleChanged, setTitleChanged] = useState(false);

  const [body, setBody] = useState(props.postRecord.body);
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
      const syncBodyResult: SyncBodyResult = await props.syncBody(postId, body);

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
      const renamePostResult: RenamePostResult = await props.renamePost(
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
    if (newTitle !== props.postRecord.title) {
      setTitle(newTitle);
      setTitleChanged(true);
    }
  };

  const onBodyChange = (newBody: PostBody) => {
    // TODO: Only mark body as changed if it is actually different
    setBody(newBody);
    setBodyChanged(true);
  };

  const {
    idleTimer,
    documentTitle,
    richTextEditor,
  } = useEditablePostComponents({
    onIdle: onIdle,
    readOnly: readOnly,

    title: title,
    body: body,

    onTitleChange: onTitleChange,
    onBodyChange: onBodyChange,

    onMentionSearchChanged: props.onMentionSearchChanged,
    mentionables: props.mentionables,
    onMentionAdded: props.onMentionAdded,
    mentionableElementFn: props.mentionableElementFn,
  });

  const authorLink = (
    <PostAuthorLink viewer={props.viewer} author={props.author} />
  );

  const postView = (
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
  );

  return <BasePostView readOnly={readOnly} postView={postView} />;
};

type PostViewControllerProps = {
  viewer: UserRecord;
  getUser: GetUserFn;
  getPost: (uid: UserId, postId: PostId) => Promise<PostRecord | undefined>;
  getGlobalMentions: GetGlobalMentionsFn;
  renamePost: RenamePostFn;
  syncBody: SyncBodyFn;
  createPost: CreatePostFn;
};

type PostViewControllerParams = {
  authorId: UserId;
  postId: PostId;
};

export const PostViewController = (props: PostViewControllerProps) => {
  const logger = log.getLogger("PostViewController");
  const styles = useStyles();

  const { authorId, postId } = useParams<PostViewControllerParams>();
  const readOnly = props.viewer.uid !== authorId;
  const [postRecord, setPostRecord] = useState<PostRecord | undefined>(
    undefined
  );
  const [postRecordLoaded, setPostRecordLoaded] = useState(false);
  const [mentionables, onMentionSearchChanged, onMentionAdded] = useMentions(
    props.getGlobalMentions,
    props.createPost,
    authorId
  );

  const [authorUserRecord, setAuthorUserRecord] = useState<
    UserRecord | undefined
  >(undefined);

  const [authorUserRecordLoaded, setAuthorUserRecordLoaded] = useState(false);

  const mentionableElementFn = (option: MentionNodeData): JSX.Element => {
    if (option.authorId === props.authorUserRecord.uid) {
      return <Typography>{option.value}</Typography>;
    } else {
      return (
        <Typography>
          {option.value} - <em>{option.authorUsername}</em>
        </Typography>
      );
    }
  };

  // Attempt to load post
  // TODO: Encapsulate this in a use*-style hook
  useEffect(() => {
    const loadPostRecord = async () => {
      const post = await props.getPost(authorId, postId);
      setPostRecord(post);
      setPostRecordLoaded(true);
    };
    loadPostRecord();
  }, [authorId, postId, props]);

  useEffect(() => {
    const loadAuthorUserRecord = async () => {
      setAuthorUserRecord(await props.getUser(authorId));
      setAuthorUserRecordLoaded(true);
    };
    loadAuthorUserRecord();
  }, [authorId, props]);

  if (!postRecordLoaded || !authorUserRecordLoaded) {
    return <CircularProgress className={styles.loadingIndicator} />;
  } else if (!postRecord) {
    // TODO: Is this the right place to redirect?
    return <Redirect to={"/404"} />;
  } else if (!authorUserRecord) {
    const errMessage = `Loaded post ${postId} for author ${authorId}, but author user record was not found`;
    logger.error(errMessage);
    throw new Error(errMessage);
  }

  // Define helpers
  const getTitle: () => Promise<PostTitle | undefined> = async () => {
    const postRecord = await props.getPost(authorId, postId);
    return postRecord ? postRecord.title : undefined;
  };

  return (
    <PostView
      viewer={props.viewer}
      author={authorUserRecord}
      readOnly={readOnly}
      postRecord={postRecord}
      getTitle={getTitle}
      renamePost={props.renamePost}
      syncBody={props.syncBody}
      mentionables={mentionables}
      onMentionSearchChanged={onMentionSearchChanged}
      onMentionAdded={onMentionAdded}
      mentionableElementFn={mentionableElementFn}
    />
  );
};
