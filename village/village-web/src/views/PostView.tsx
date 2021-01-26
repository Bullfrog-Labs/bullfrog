import React, {
  Dispatch,
  forwardRef,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useGlobalStyles } from "../styles/styles";
import RichTextEditor, {
  RichTextEditorImperativeHandle,
  RichTextEditorMentionTypeaheadComponents,
} from "../components/richtext/RichTextEditor";
import * as log from "loglevel";
import { MentionsSection } from "../components/mentions/MentionsSection";
import {
  CircularProgress,
  makeStyles,
  Paper,
  Grid,
  Divider,
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
  GetAllPostsByTitlePrefixFn,
  UserPost,
  GetMentionUserPostsFn,
  GetPostFn,
  DeletePostFn,
} from "../services/store/Posts";
import {
  GetUserByUsernameFn,
  GetUserFn,
  UserId,
  UserRecord,
} from "../services/store/Users";
import { useMentions } from "../hooks/useMentions";
import { Redirect, useHistory, useParams } from "react-router-dom";
import { assertNever } from "../utils";
import { MentionNodeData } from "@blfrg.xyz/slate-plugins";
import { DocumentTitle } from "../components/richtext/DocumentTitle";
import {
  EMPTY_RICH_TEXT,
  MentionInContext,
  findMentionsInPosts,
} from "../components/richtext/Utils";
import { PostSubtitleRow } from "../components/PostSubtitleRow";
import { EditableTypographyImperativeHandle } from "../components/richtext/EditableTypography";
import { Helmet } from "react-helmet";
import {
  coalesceMaybeToLoadableRecord,
  useLoadableRecord,
} from "../hooks/useLoadableRecord";
import { useQuery } from "../hooks/useQuery";
import { postURL } from "../routing/URLs";
import {
  CurriedByUser,
  useLoggedInUserFromAppAuthContext,
  useUserFromAppAuthContext,
} from "../services/auth/AppAuth";
import { MentionSuggestionLine } from "../components/mentions/MentionSuggestionLine";

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
      mentionTypeaheadComponents={mentionableComponents}
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

export type EditablePostCallbacks = {
  getGlobalMentions: GetAllPostsByTitlePrefixFn;
  renamePost: CurriedByUser<RenamePostFn>;
  syncBody: CurriedByUser<SyncBodyFn>;
  createPost: CurriedByUser<CreatePostFn>;
  deletePost: DeletePostFn;
};

export type EditablePostViewProps = {
  postId: PostId;
  author: UserRecord;
  updatedAt: Date | undefined;
  mentions: MentionInContext[];

  title: PostTitle;
  setTitle: Dispatch<SetStateAction<PostTitle>>;

  body: PostBody;
  setBody: Dispatch<SetStateAction<PostBody>>;

  getPost: GetPostFn;

  editablePostCallbacks: EditablePostCallbacks;
};

type PostViewImperativeHandle = {
  blurTitle: () => void;
  blurBody: () => void;
};

const useAssembledPostView = (
  subtitleRow: React.ReactChild,
  documentTitle: React.ReactChild,
  richTextEditor: React.ReactChild,
  idleTimer?: React.ReactChild
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

export type ReadOnlyPostViewProps = {
  postId: PostId;
  author: UserRecord;
  updatedAt: Date | undefined;
  mentions: MentionInContext[];

  title: PostTitle;
  body: PostBody;
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
  });

  const subtitleRow = (
    <PostSubtitleRow
      author={props.author}
      postTitle={props.title}
      postId={props.postId}
      updatedAt={props.updatedAt}
      numMentions={props.mentions.length}
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

// Changing title triggers a rename. Renames are not allowed if the title is
// already being used.
export const EditablePostView = forwardRef<
  PostViewImperativeHandle,
  EditablePostViewProps
>((props, ref) => {
  const logger = log.getLogger("EditablePostView");

  const { getPost, author, postId, editablePostCallbacks } = props;
  const {
    getGlobalMentions,
    createPost,
    deletePost,
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
  };

  const onTitleChange = (newTitle: PostTitle) => {
    if (newTitle !== props.title) {
      props.setTitle(newTitle);
      setTitleChanged(true);
    }
  };

  const onBodyChange = (newBody: PostBody) => {
    // TODO: Only mark body as changed if it is actually different
    props.setBody(newBody);
    setBodyChanged(true);
  };

  const mentionableElementFn = (uid: UserId) => (
    option: MentionNodeData
  ): JSX.Element => {
    return <MentionSuggestionLine uid={uid} option={option} />;
  };

  const [mentionables, onMentionSearchChanged, onMentionAdded] = useMentions(
    getGlobalMentions,
    createPost(viewer),
    viewer.username || ""
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
      onMentionSearchChanged: onMentionSearchChanged(viewer.uid),
      mentionables: mentionables,
      onMentionAdded: onMentionAdded,
      mentionableElementFn: mentionableElementFn(viewer.uid),
    },
  });

  const subtitleRow = (
    <PostSubtitleRow
      author={props.author}
      postTitle={props.title}
      postId={props.postId}
      updatedAt={props.updatedAt}
      numMentions={props.mentions.length}
      deletePost={deletePost}
    />
  );

  const postView = useAssembledPostView(
    subtitleRow,
    documentTitle,
    richTextEditor,
    idleTimer
  );

  useImperativeHandle(ref, () => ({
    blurTitle: () => documentTitleRef.current?.blurEditor(),
    blurBody: () => richTextEditorRef.current?.blurEditor(),
  }));

  return <BasePostView postView={postView} mentions={props.mentions} />;
});

export type PostViewControllerProps = {
  getUser: GetUserFn;
  getUserByUsername: GetUserByUsernameFn;
  getPost: GetPostFn;
  getMentionUserPosts: GetMentionUserPostsFn;

  editablePostCallbacks: EditablePostCallbacks;
};

type PostViewControllerParams = {
  authorIdOrUsername: UserId | string;
  postId: PostId;
};

export const PostViewController = (props: PostViewControllerProps) => {
  const logger = log.getLogger("PostViewController");
  const history = useHistory();
  const globalClasses = useGlobalStyles();

  const viewer = useUserFromAppAuthContext();

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

  const postView = loggedInAsAuthor ? (
    <EditablePostView
      ref={postViewRef}
      postId={postId}
      author={authorRecord.get()}
      updatedAt={updatedAt}
      title={title!}
      setTitle={setTitle}
      body={body!}
      setBody={setBody}
      getPost={getPost}
      mentions={mentions!}
      editablePostCallbacks={editablePostCallbacks}
    />
  ) : (
    <ReadOnlyPostView
      ref={postViewRef}
      postId={postId}
      author={authorRecord.get()}
      updatedAt={updatedAt}
      title={title!}
      body={body!}
      mentions={mentions!}
    />
  );

  const pageTitle = `${title!} by ${
    authorId === viewer?.uid ? "you" : authorRecord.get()?.username
  }`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      {postView}
    </>
  );
};
