import { MentionNodeData } from "@blfrg.xyz/slate-plugins";
import {
  CircularProgress,
  Divider,
  Grid,
  makeStyles,
  Paper,
} from "@material-ui/core";
import * as log from "loglevel";
import React, {
  Dispatch,
  forwardRef,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Helmet } from "react-helmet";
import IdleTimer from "react-idle-timer";
import { Redirect, useHistory, useParams } from "react-router-dom";
import {
  SaveIndicator,
  useSaveIndicatorState,
} from "../components/editor/SaveIndicator";
import { MentionsSection } from "../components/mentions/MentionsSection";
import { MentionSuggestionLine } from "../components/mentions/MentionSuggestionLine";
import { PostSubtitleRow } from "../components/PostSubtitleRow";
import { DocumentTitle } from "../components/richtext/DocumentTitle";
import { EditableTypographyImperativeHandle } from "../components/richtext/EditableTypography";
import RichTextEditor, {
  RichTextEditorImperativeHandle,
  RichTextEditorMentionTypeaheadComponents,
} from "../components/richtext/RichTextEditor";
import {
  EMPTY_RICH_TEXT,
  findMentionsInPosts,
  MentionInContext,
  postPreviewStringFromStart,
} from "../components/richtext/Utils";
import { useFollowablePostViewState } from "../hooks/posts/useFollowablePostViewState";
import {
  coalesceMaybeToLoadableRecord,
  useLoadableRecord,
} from "../hooks/useLoadableRecord";
import { useMentions } from "../hooks/useMentions";
import { useQuery } from "../hooks/useQuery";
import { postURL } from "../routing/URLs";
import { LogEventFn } from "../services/Analytics";
import {
  CurriedByUser,
  useLoggedInUserFromAppAuthContext,
  useWhitelistedUserFromAppAuthContext,
} from "../services/auth/AppAuth";
import { FollowablePostCallbacks } from "../services/follows/Types";
import {
  CreatePostFn,
  DeletePostFn,
  GetAllPostsByTitlePrefixFn,
  GetMentionUserPostsFn,
  GetPostFn,
  PostBody,
  PostId,
  PostRecord,
  PostTitle,
  RenamePostFn,
  RenamePostResult,
  SyncBodyFn,
  SyncBodyResult,
  UserPost,
} from "../services/store/Posts";
import {
  GetUserByUsernameFn,
  GetUserFn,
  UserId,
  UserRecord,
} from "../services/store/Users";
import { useGlobalStyles } from "../styles/styles";
import { assertNever } from "../utils";

const useStyles = makeStyles((theme) => ({
  postView: {
    marginTop: theme.spacing(5),
  },
  leftGutter: {
    paddingLeft: theme.spacing(1),
    paddingTop: theme.spacing(1),
  },
  postDetails: {
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(2),
  },
}));

const DEFAULT_IDLE_TIME = 1 * 1000;

export type BasePostViewProps = {
  postView: React.ReactChild;
  mentions?: MentionInContext[];
};

export const BasePostView = (props: BasePostViewProps) => {
  return (
    <Grid container spacing={3}>
      <Grid item sm={12}>
        <Paper elevation={0}>{props.postView}</Paper>
      </Grid>
      {props.mentions && props.mentions.length > 0 && (
        <React.Fragment>
          <Grid item sm={12}>
            <Paper elevation={0}>
              <Divider />
              <Grid container spacing={1}>
                <Grid item sm={12}>
                  <MentionsSection mentions={props.mentions} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </React.Fragment>
      )}
    </Grid>
  );
};

type OnIdleComponents = {
  idleTime?: number;
  buildOnIdle: (
    documentTitleRef: RefObject<EditableTypographyImperativeHandle>
  ) => (event: Event) => void;
};

type PostComponentInputs = {
  readOnly: boolean;

  title: PostTitle;
  body: PostBody;

  onTitleChange: (newTitle: PostTitle) => void;
  onBodyChange: (newBody: PostBody) => void;

  onIdleComponents?: OnIdleComponents;
  mentionableComponents?: RichTextEditorMentionTypeaheadComponents;

  logEvent: LogEventFn;
};

type PostComponents = {
  idleTimer?: React.ReactChild;
  documentTitle: React.ReactChild;
  documentTitleRef: RefObject<EditableTypographyImperativeHandle>;
  richTextEditor: React.ReactChild;
  richTextEditorRef: RefObject<RichTextEditorImperativeHandle>;
};

const usePostComponents: (inputs: PostComponentInputs) => PostComponents = ({
  onIdleComponents,
  readOnly,
  title,
  body,
  onTitleChange,
  onBodyChange,
  mentionableComponents,
  logEvent,
}) => {
  const richTextEditorRef = useRef<RichTextEditorImperativeHandle>(null);
  const documentTitleRef = useRef<EditableTypographyImperativeHandle>(null);

  if (readOnly === !!onIdleComponents) {
    throw new Error("Idle components should be present iff editable post");
  }

  if (readOnly === !!mentionableComponents) {
    throw new Error(
      "Mentionable components should be present iff editable post"
    );
  }

  const idleTimer = !!onIdleComponents ? (
    <IdleTimer
      timeout={onIdleComponents.idleTime ?? DEFAULT_IDLE_TIME}
      onIdle={onIdleComponents.buildOnIdle(documentTitleRef)}
    />
  ) : undefined;

  const documentTitle = (
    <DocumentTitle
      ref={documentTitleRef}
      readOnly={readOnly}
      handleEscape={useCallback(() => {
        richTextEditorRef.current?.focusEditor();
      }, [])}
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
      mentionTypeaheadComponents={mentionableComponents}
      logEvent={logEvent}
    />
  );

  const result: PostComponents = {
    idleTimer: idleTimer,
    documentTitle: documentTitle,
    documentTitleRef: documentTitleRef,
    richTextEditor: richTextEditor,
    richTextEditorRef: richTextEditorRef,
  };

  return result;
};

const useAssembledPostView = (
  subtitleRow: React.ReactChild,
  documentTitle: React.ReactChild,
  richTextEditor: React.ReactChild,
  idleTimer?: React.ReactChild,
  saveIndicator?: React.ReactChild
) => {
  const classes = useStyles();

  const header = (
    <Grid item>
      <Grid
        container
        direction="column"
        justify="flex-start"
        alignItems="stretch"
        spacing={1}
      >
        <Grid item>{documentTitle}</Grid>
        <Grid item>{subtitleRow}</Grid>
      </Grid>
    </Grid>
  );

  const postDetails = (
    <div className={classes.postDetails}>
      <Grid
        container
        direction="column"
        justify="flex-start"
        alignItems="stretch"
        spacing={4}
      >
        <Grid item>{header}</Grid>
        <Grid item>
          <div>{richTextEditor}</div>
        </Grid>
      </Grid>
    </div>
  );

  const postView = (
    <>
      {!!idleTimer && idleTimer}
      {!!saveIndicator && saveIndicator}
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="flex-start"
        spacing={1}
      >
        <Grid item sm={12}>
          {postDetails}
        </Grid>
      </Grid>
    </>
  );
  return postView;
};

type PostViewImperativeHandle = {
  blurTitle: () => void;
  blurBody: () => void;
};

export type ReadOnlyPostViewProps = {
  postId: PostId;
  postRecord: PostRecord;
  author: UserRecord;
  updatedAt: Date | undefined;
  mentions: MentionInContext[];

  title: PostTitle;
  body: PostBody;

  followablePostCallbacks: FollowablePostCallbacks;

  logEvent: LogEventFn;
};

export const ReadOnlyPostView = forwardRef<
  PostViewImperativeHandle,
  ReadOnlyPostViewProps
>((props, ref) => {
  const {
    documentTitle,
    documentTitleRef,
    richTextEditor,
    richTextEditorRef,
  } = usePostComponents({
    readOnly: true,

    title: props.title,
    body: props.body,

    onTitleChange: () => {},
    onBodyChange: () => {},

    logEvent: props.logEvent,
  });

  const followablePostViewState = useFollowablePostViewState(
    props.postRecord.followCount,
    props.author.uid,
    props.postId,
    props.followablePostCallbacks
  );

  const subtitleRow = (
    <PostSubtitleRow
      author={props.author}
      postTitle={props.title}
      postId={props.postId}
      updatedAt={props.updatedAt}
      numMentions={props.mentions.length}
      logEvent={props.logEvent}
      followablePostViewState={followablePostViewState}
    />
  );

  const postView = useAssembledPostView(
    subtitleRow,
    documentTitle,
    richTextEditor
  );

  useImperativeHandle(ref, () => ({
    blurTitle: () => documentTitleRef.current?.blurEditor(),
    blurBody: () => richTextEditorRef.current?.blurEditor(),
  }));

  return <BasePostView postView={postView} mentions={props.mentions} />;
});

export type EditablePostCallbacks = {
  getGlobalMentions: GetAllPostsByTitlePrefixFn;
  renamePost: CurriedByUser<RenamePostFn>;
  syncBody: CurriedByUser<SyncBodyFn>;
  createPost: CurriedByUser<CreatePostFn>;
  deletePost: DeletePostFn;
};

export type EditablePostViewProps = {
  postId: PostId;
  postRecord: PostRecord;
  author: UserRecord;
  updatedAt: Date | undefined;
  mentions: MentionInContext[];

  title: PostTitle;
  setTitle: Dispatch<SetStateAction<PostTitle>>;

  body: PostBody;
  setBody: Dispatch<SetStateAction<PostBody>>;

  getPost: GetPostFn;

  editablePostCallbacks: EditablePostCallbacks;
  followablePostCallbacks: FollowablePostCallbacks;

  logEvent: LogEventFn;
};

// Changing title triggers a rename. Renames are not allowed if the title is
// already being used.
export const EditablePostView = forwardRef<
  PostViewImperativeHandle,
  EditablePostViewProps
>((props, ref) => {
  const globalClasses = useGlobalStyles();
  const logger = log.getLogger("EditablePostView");

  const {
    title,
    setTitle,
    setBody,
    getPost,
    author,
    postId,
    postRecord,
    editablePostCallbacks,
  } = props;
  const {
    getGlobalMentions,
    createPost,
    syncBody,
    renamePost,
  } = editablePostCallbacks;

  const viewer = useLoggedInUserFromAppAuthContext();
  const authorId = author.uid;

  if (viewer.uid !== authorId) {
    throw new Error(
      "EditablePostView should have only be used if the viewer is the author"
    );
  }

  // Define helpers
  const getTitle: () => Promise<
    PostTitle | undefined
  > = useCallback(async () => {
    const postRecord = await getPost(authorId, postId);
    return postRecord ? postRecord.title : undefined;
  }, [authorId, getPost, postId]);

  const [bodyChanged, setBodyChanged] = useState(false);
  const [titleChanged, setTitleChanged] = useState(false);

  const saveIndicatorState = useSaveIndicatorState();
  const [saveStatus, setSaveStatus] = saveIndicatorState.saveStatus;
  const [saveIndicatorOpen, setSaveIndicatorOpen] = saveIndicatorState.open;

  const [isDeleting, setIsDeleting] = useState(false);
  const deletePost: DeletePostFn = async (...args) => {
    setIsDeleting(true);
    await editablePostCallbacks.deletePost(...args);
    setIsDeleting(false);
  };

  const buildOnIdle = (
    documentTitleRef: RefObject<EditableTypographyImperativeHandle>
  ) => async () => {
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
      setSaveStatus("saving-changes");
      const syncBodyResult: SyncBodyResult = await syncBody(viewer)(
        props.postId,
        props.body
      );

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
      setSaveStatus("saving-changes");
      const renamePostResult: RenamePostResult = await renamePost(viewer)(
        props.postId,
        props.title
      );

      switch (renamePostResult.state) {
        case "success":
          // TODO: Display something to show the user that the rename succeeded
          logger.info(`Post renamed to ${props.title}`);
          setTitleChanged(false);
          props.setTitle(props.title);
          documentTitleRef.current?.setSelectionToEnd();
          break;
        case "post-name-taken":
          const savedTitle = await getTitle();
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
            `Post rename failed, ${props.title} already taken. Reverting to saved title ${savedTitle}`
          );

          documentTitleRef.current?.deselect();
          props.setTitle(savedTitle);
          setTitleChanged(false);
          documentTitleRef.current?.setSelectionToEnd();

          break;
        default:
          assertNever(renamePostResult);
      }
    }

    setSaveStatus("all-changes-saved");
  };

  const onTitleChange = useCallback(
    (newTitle: PostTitle) => {
      if (newTitle !== title) {
        setTitle(newTitle);
        setTitleChanged(true);
        setSaveStatus("changes-unsaved");
      }
    },
    [setSaveStatus, setTitle, title]
  );

  const onBodyChange = useCallback(
    (newBody: PostBody) => {
      // TODO: Only mark body as changed if it is actually different
      setBody(newBody);
      setBodyChanged(true);
      setSaveStatus("changes-unsaved");
    },
    [setBody, setSaveStatus]
  );

  const mentionableElementFn = (option: MentionNodeData): JSX.Element => {
    return <MentionSuggestionLine uid={viewer.uid} option={option} />;
  };

  const [mentionables, onMentionSearchChanged, onMentionAdded] = useMentions(
    getGlobalMentions,
    createPost(viewer),
    viewer
  );

  const {
    idleTimer,
    documentTitle,
    documentTitleRef,
    richTextEditor,
    richTextEditorRef,
  } = usePostComponents({
    readOnly: false,

    title: props.title,
    body: props.body,

    onTitleChange: onTitleChange,
    onBodyChange: onBodyChange,

    onIdleComponents: {
      buildOnIdle: buildOnIdle,
    },

    mentionableComponents: {
      onMentionSearchChanged: onMentionSearchChanged,
      mentionables: mentionables,
      onMentionAdded: onMentionAdded,
      mentionableElementFn: mentionableElementFn,
    },

    logEvent: props.logEvent,
  });

  const followablePostViewState = useFollowablePostViewState(
    postRecord.followCount,
    props.author.uid,
    props.postId,
    props.followablePostCallbacks
  );

  const subtitleRow = (
    <PostSubtitleRow
      author={props.author}
      postTitle={props.title}
      postId={props.postId}
      updatedAt={props.updatedAt}
      numMentions={props.mentions.length}
      followablePostViewState={followablePostViewState}
      deletePost={deletePost}
      logEvent={props.logEvent}
    />
  );

  const saveIndicator = (
    <SaveIndicator
      open={saveIndicatorOpen}
      setOpen={setSaveIndicatorOpen}
      state={saveStatus}
    />
  );

  const postView = useAssembledPostView(
    subtitleRow,
    documentTitle,
    richTextEditor,
    idleTimer,
    saveIndicator
  );

  useImperativeHandle(ref, () => ({
    blurTitle: () => documentTitleRef.current?.blurEditor(),
    blurBody: () => richTextEditorRef.current?.blurEditor(),
  }));

  return isDeleting ? (
    <CircularProgress className={globalClasses.loadingIndicator} />
  ) : (
    <BasePostView postView={postView} mentions={props.mentions} />
  );
});

export type PostViewControllerProps = {
  getUser: GetUserFn;
  getUserByUsername: GetUserByUsernameFn;
  getPost: GetPostFn;
  getMentionUserPosts: GetMentionUserPostsFn;

  editablePostCallbacks: EditablePostCallbacks;
  followablePostCallbacks: FollowablePostCallbacks;

  logEvent: LogEventFn;
};

type PostViewControllerParams = {
  authorIdOrUsername: UserId | string;
  postId: PostId;
};

export const PostViewController = (props: PostViewControllerProps) => {
  const logger = log.getLogger("PostViewController");
  const history = useHistory();
  const globalClasses = useGlobalStyles();

  const viewer = useWhitelistedUserFromAppAuthContext();

  const { authorIdOrUsername, postId } = useParams<PostViewControllerParams>();
  const query = useQuery();
  const authorById = !!query.get("byId");

  const [title, setTitle] = useState<PostTitle>("");
  const [body, setBody] = useState<PostBody>(EMPTY_RICH_TEXT);
  const [updatedAt, setUpdatedAt] = useState<Date>();

  const postViewRef = useRef<PostViewImperativeHandle>(null);

  const {
    getUser,
    getUserByUsername,
    getPost,
    getMentionUserPosts,
    editablePostCallbacks,
    followablePostCallbacks,
    logEvent,
  } = props;

  const [authorRecord, setAuthorRecord] = useLoadableRecord<UserRecord>();
  const [postRecord, setPostRecord] = useLoadableRecord<PostRecord>();
  const [mentionPosts, setMentionPosts] = useLoadableRecord<UserPost[]>();

  useEffect(() => {
    let isSubscribed = true; // used to prevent state updates on unmounted components
    const loadAuthorRecord = async () => {
      const result = coalesceMaybeToLoadableRecord(
        await (authorById
          ? getUser(authorIdOrUsername)
          : getUserByUsername(authorIdOrUsername))
      );

      if (!isSubscribed) {
        return;
      }

      if (authorById && !!result[0]) {
        history.replace(postURL(result[0].username, postId));
      }
      setAuthorRecord(...result);
    };
    loadAuthorRecord();
    return () => {
      isSubscribed = false;
    };
  }, [
    authorById,
    authorIdOrUsername,
    getUser,
    getUserByUsername,
    history,
    postId,
    setAuthorRecord,
  ]);

  useEffect(() => {
    let isSubscribed = true; // used to prevent state updates on unmounted components
    const loadPostRecord = async () => {
      if (!authorRecord.loaded() || !authorRecord.exists()) {
        return;
      }

      const authorId = authorRecord.get().uid;
      const result = coalesceMaybeToLoadableRecord(
        await getPost(authorId, postId)
      );

      if (!isSubscribed) {
        return;
      }

      setPostRecord(...result);

      const [record, existence] = result;
      switch (existence) {
        case "does-not-exist":
          logger.info(`Post ${postId} for author ${authorId} not found.`);
          break;
        case "exists":
          // when navigating from PostView to another PostView, we need to remove
          // focus from the title and body when loading in the destination title
          // and body because using the source cursor position may be unexpected
          // for the user and it may not even be a valid cursor position.
          postViewRef.current?.blurTitle();
          postViewRef.current?.blurBody();
          setTitle(record!.title);
          setBody(record!.body);
          setUpdatedAt(record!.updatedAt);
          break;
        default:
          assertNever(existence);
          break;
      }
    };
    loadPostRecord();
    return () => {
      isSubscribed = false;
    };
  }, [authorRecord, getPost, logger, postId, setPostRecord]);

  useEffect(() => {
    let isSubscribed = true;
    const loadMentionPosts = async () => {
      const result = await getMentionUserPosts(postId);
      if (!isSubscribed) {
        return;
      }
      setMentionPosts(result, "exists");
    };
    loadMentionPosts();

    return () => {
      isSubscribed = false;
    };
  }, [getMentionUserPosts, postId, setMentionPosts]);

  const postPreviewString = useMemo(
    () => postPreviewStringFromStart(body, 200),
    [body]
  );

  const progressIndicator = (
    <CircularProgress className={globalClasses.loadingIndicator} />
  );
  const onAuthorOrPostNotFound = () => {
    logger.info(`Post ${postId} for author ${authorIdOrUsername} not found`);
    return <Redirect to={"/404"} />;
  };

  if (!authorRecord.loaded()) {
    return progressIndicator;
  } else if (!authorRecord.exists()) {
    return onAuthorOrPostNotFound();
  } else if (!postRecord.loaded()) {
    return progressIndicator;
  } else if (!postRecord.exists()) {
    return onAuthorOrPostNotFound();
  } else if (!mentionPosts.loaded()) {
    return progressIndicator;
  }

  const mentions = findMentionsInPosts(mentionPosts.get(), postId);

  const authorId = authorRecord.get().uid;
  const loggedInAsAuthor = viewer?.uid === authorId;

  const pageTitle = `${title!} by ${
    authorId === viewer?.uid ? "you" : authorRecord.get()?.username
  }`;

  logger.debug(`Using ${postPreviewString} as og:description`);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="twitter:card" content="summary"></meta>
        <meta property="og:title" content={title} />
        <meta
          name="twitter:creator"
          content={`@${authorRecord.get().username}`}
        ></meta>
        <meta name="twitter:site" content="@getvillageink"></meta>
        <meta name="description" content={postPreviewString}></meta>
      </Helmet>
      {loggedInAsAuthor ? (
        <EditablePostView
          ref={postViewRef}
          postId={postId}
          postRecord={postRecord.get()}
          author={authorRecord.get()}
          updatedAt={updatedAt}
          title={title!}
          setTitle={setTitle}
          body={body!}
          setBody={setBody}
          getPost={getPost}
          mentions={mentions!}
          editablePostCallbacks={editablePostCallbacks}
          followablePostCallbacks={followablePostCallbacks}
          logEvent={logEvent}
        />
      ) : (
        <ReadOnlyPostView
          ref={postViewRef}
          postId={postId}
          postRecord={postRecord.get()}
          author={authorRecord.get()}
          updatedAt={updatedAt}
          title={title!}
          body={body!}
          mentions={mentions!}
          followablePostCallbacks={followablePostCallbacks}
          logEvent={logEvent}
        />
      )}
    </>
  );
};
