import React, {
  Dispatch,
  forwardRef,
  RefObject,
  SetStateAction,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useGlobalStyles } from "../styles/styles";
import RichTextEditor, {
  RichTextEditorImperativeHandle,
} from "../components/richtext/RichTextEditor";
import * as log from "loglevel";
import { MentionsSection } from "../components/MentionsSection";
import {
  CircularProgress,
  makeStyles,
  Paper,
  Grid,
  Typography,
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
  useUserFromAppAuthContext,
} from "../services/auth/AppAuth";

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

type EditablePostInputs = {
  idleTime?: number;
  buildOnIdle: (
    documentTitleRef: RefObject<EditableTypographyImperativeHandle>
  ) => (event: Event) => void;

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
  documentTitleRef: RefObject<EditableTypographyImperativeHandle>;
  richTextEditor: React.ReactChild;
  richTextEditorRef: RefObject<RichTextEditorImperativeHandle>;
};

const useEditablePostComponents: (
  inputs: EditablePostInputs
) => EditablePostComponents = ({
  idleTime,
  buildOnIdle,
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
  const documentTitleRef = useRef<EditableTypographyImperativeHandle>(null);

  const onIdle = buildOnIdle(documentTitleRef);

  const idleTimer = (
    <IdleTimer timeout={idleTime ?? DEFAULT_IDLE_TIME} onIdle={onIdle} />
  );

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

  // TODO: How to make this work with read-only mode?
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
    documentTitleRef: documentTitleRef,
    richTextEditor: richTextEditor,
    richTextEditorRef: richTextEditorRef,
  };

  return result;
};

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

const MentionSuggestionLine = (props: {
  option: MentionNodeData;
  uid: string;
}) => {
  const { option, uid } = props;
  const globalClasses = useGlobalStyles();
  if (!option.exists) {
    return (
      <Typography
        variant="body1"
        className={globalClasses.searchSuggestionLine}
      >
        <span className={globalClasses.searchPrefixPart}>New post: </span>{" "}
        {option.value}
      </Typography>
    );
  } else if (option.authorId === uid) {
    return (
      <Typography
        variant="body1"
        className={globalClasses.searchSuggestionLine}
      >
        {option.value}
      </Typography>
    );
  } else {
    return (
      <Typography
        variant="body1"
        className={globalClasses.searchSuggestionLine}
      >
        {option.value}{" "}
        <em style={{ fontWeight: 400 }}>by {option.authorUsername}</em>
      </Typography>
    );
  }
};

const mentionableElementFn = (uid: UserId) => (
  option: MentionNodeData
): JSX.Element => {
  return <MentionSuggestionLine uid={uid} option={option} />;
};

export type PostViewProps = {
  readOnly: boolean;

  postId: PostId;

  title: PostTitle;
  setTitle: Dispatch<SetStateAction<PostTitle>>;

  body: PostBody;
  setBody: Dispatch<SetStateAction<PostBody>>;
  updatedAt: Date | undefined;

  author: UserRecord;
  mentions: MentionInContext[];

  getTitle: () => Promise<PostTitle | undefined>;

  renamePost: RenamePostFn;
  syncBody: SyncBodyFn;
  deletePost: DeletePostFn;
  onMentionSearchChanged: (newSearch: string) => void;
  mentionables: MentionNodeData[];
  onMentionAdded: (option: MentionNodeData) => void;
  mentionableElementFn: (option: MentionNodeData) => JSX.Element;
};

export interface ReadOnlyPostViewProps {}

export interface EditablePostViewProps {}

type PostViewImperativeHandle = {
  blurTitle: () => void;
  blurBody: () => void;
};

// TODO: Can PostView be decomposed into read-only and editable versions?

// Changing title triggers a rename. Renames are not allowed if the title is
// already being used.
export const PostView = forwardRef<PostViewImperativeHandle, PostViewProps>(
  (props, ref) => {
    const classes = useStyles();
    const logger = log.getLogger("PostView");

    if (props.readOnly) {
      logger.info(`rendering read-only view for ${props.title}`);
    }

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
        const syncBodyResult: SyncBodyResult = await props.syncBody(
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
        const renamePostResult: RenamePostResult = await props.renamePost(
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

    const {
      idleTimer,
      documentTitle,
      documentTitleRef,
      richTextEditor,
      richTextEditorRef,
    } = useEditablePostComponents({
      buildOnIdle: buildOnIdle,
      readOnly: props.readOnly,

      title: props.title,
      body: props.body,

      onTitleChange: onTitleChange,
      onBodyChange: onBodyChange,

      onMentionSearchChanged: props.onMentionSearchChanged,
      mentionables: props.mentionables,
      onMentionAdded: props.onMentionAdded,
      mentionableElementFn: props.mentionableElementFn,
    });

    const authorLink = (
      <PostSubtitleRow
        author={props.author}
        postTitle={props.title}
        postId={props.postId}
        updatedAt={props.updatedAt}
        numMentions={props.mentions.length}
        deletePost={props.deletePost}
      />
    );

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
          <Grid item>{authorLink}</Grid>
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
        {idleTimer}
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

    useImperativeHandle(ref, () => ({
      blurTitle: () => documentTitleRef.current?.blurEditor(),
      blurBody: () => richTextEditorRef.current?.blurEditor(),
    }));

    return <BasePostView postView={postView} mentions={props.mentions} />;
  }
);

type PostViewControllerProps = {
  getUser: GetUserFn;
  getUserByUsername: GetUserByUsernameFn;
  getPost: GetPostFn;
  getGlobalMentions: GetAllPostsByTitlePrefixFn;
  renamePost: CurriedByUser<RenamePostFn>;
  syncBody: CurriedByUser<SyncBodyFn>;
  createPost: CurriedByUser<CreatePostFn>;
  getMentionUserPosts: GetMentionUserPostsFn;
  deletePost: DeletePostFn;
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

  const { getUser, getUserByUsername, getPost, getMentionUserPosts } = props;

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

  // TODO: Move this down in the component tree, because mentions should not be
  // available in read-only posts. Especially does not make sense for
  // unauthenticated users.
  const [mentionables, onMentionSearchChanged, onMentionAdded] = useMentions(
    props.getGlobalMentions,
    props.createPost,
    authorRecord.state.record?.username || ""
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

  // Define helpers
  const getTitle: () => Promise<PostTitle | undefined> = async () => {
    const postRecord = await props.getPost(authorId, postId);
    return postRecord ? postRecord.title : undefined;
  };

  const authorId = authorRecord.get().uid;
  const readOnly = viewer?.uid !== authorId;

  const pageTitle = `${title!} by ${
    authorId === viewer?.uid ? "you" : authorRecord.get()?.username
  }`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <PostView
        ref={postViewRef}
        author={authorRecord.get()}
        readOnly={readOnly}
        postId={postId}
        title={title!}
        setTitle={setTitle}
        body={body!}
        mentions={mentions!}
        setBody={setBody}
        getTitle={getTitle}
        renamePost={props.renamePost}
        syncBody={props.syncBody}
        mentionables={mentionables}
        onMentionSearchChanged={onMentionSearchChanged(authorId)}
        onMentionAdded={onMentionAdded}
        mentionableElementFn={mentionableElementFn(authorId)}
        updatedAt={updatedAt}
        deletePost={props.deletePost}
      />
    </>
  );
};
