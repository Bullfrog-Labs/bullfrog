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
import RichTextEditor, {
  RichTextEditorImperativeHandle,
} from "../components/richtext/RichTextEditor";
import * as log from "loglevel";
import {
  CircularProgress,
  makeStyles,
  Paper,
  Grid,
  Typography,
  List,
  ListItem,
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
} from "../services/store/Posts";
import { GetUserFn, UserId, UserRecord } from "../services/store/Users";
import { PostStackLink } from "../components/stacks/PostStackLink";
import { useMentions } from "../hooks/useMentions";
import { Redirect, useParams } from "react-router-dom";
import { assertNever } from "../utils";
import { MentionNodeData } from "@blfrg.xyz/slate-plugins";
import { DocumentTitle } from "../components/richtext/DocumentTitle";
import { MentionPostCard } from "../components/MentionPostCard";
import {
  EMPTY_RICH_TEXT,
  MentionInContext,
  findMentionsInPosts,
} from "../components/richtext/Utils";
import { PostAuthorLink } from "../components/identity/PostAuthorLink";
import { useGlobalStyles } from "../styles/styles";
import { EditableTypographyImperativeHandle } from "../components/richtext/EditableTypography";
import { Helmet } from "react-helmet";

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
  loadingIndicator: {
    position: "fixed",
    top: "30%",
    left: "50%",
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
  readOnly: boolean;
  postView: React.ReactChild;
  mentions?: MentionInContext[];
};

export const BasePostView = (props: BasePostViewProps) => {
  const paperElevation = props.readOnly ? 0 : 1;

  return (
    <Grid container spacing={3}>
      <Grid item sm={12}>
        <Paper elevation={paperElevation}>{props.postView}</Paper>
      </Grid>
      {props.mentions && props.mentions.length > 0 && (
        <React.Fragment>
          <Grid item sm={12}>
            <Paper elevation={paperElevation}>
              <Divider />
              <Grid container spacing={1}>
                <Grid item sm={1}></Grid>
                <Grid item sm={11}>
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

const mentionableElementFn = (uid: UserId) => (
  option: MentionNodeData
): JSX.Element => {
  if (!option.exists) {
    return (
      <Typography>
        <em>Create "{option.value}"</em>
      </Typography>
    );
  } else if (option.authorId === uid) {
    return <Typography>{option.value}</Typography>;
  } else {
    return (
      <Typography>
        {option.value} - <em>{option.authorUsername}</em>
      </Typography>
    );
  }
};

export type PostViewProps = {
  readOnly: boolean;

  postId: PostId;

  title: PostTitle;
  setTitle: Dispatch<SetStateAction<PostTitle>>;

  body: PostBody;
  setBody: Dispatch<SetStateAction<PostBody>>;

  viewer: UserRecord;
  author: UserRecord;
  mentions: MentionInContext[];

  getTitle: () => Promise<PostTitle | undefined>;

  renamePost: RenamePostFn;
  syncBody: SyncBodyFn;
  onMentionSearchChanged: (newSearch: string) => void;
  mentionables: MentionNodeData[];
  onMentionAdded: (option: MentionNodeData) => void;
  mentionableElementFn: (option: MentionNodeData) => JSX.Element;
};

type PostViewImperativeHandle = {
  blurTitle: () => void;
  blurBody: () => void;
};

const MentionsSection = (props: { mentions: MentionInContext[] }) => {
  const classes = useStyles();
  const { mentions } = props;
  const globalClasses = useGlobalStyles();

  const mentionListItems = mentions.map((mention) => {
    const mentionKey = `${mention.post.post.id}_${mention.path.join("_")}`;
    return (
      <ListItem
        alignItems="flex-start"
        key={mentionKey}
        className={globalClasses.cardListItem}
      >
        <MentionPostCard mention={mention} />
      </ListItem>
    );
  });

  return (
    <div className={classes.postDetails}>
      <Grid
        container
        direction="column"
        justify="flex-start"
        alignItems="stretch"
        spacing={4}
      >
        <Grid item>
          <Typography variant="h6">
            <em>Mentions</em>
          </Typography>
          <List>{mentionListItems}</List>
        </Grid>
      </Grid>
    </div>
  );
};

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
      <PostAuthorLink viewer={props.viewer} author={props.author} />
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

    const leftGutter = (
      <div className={classes.leftGutter}>
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="flex-start"
          spacing={1}
        >
          <Grid item>
            <PostStackLink postTitle={props.title} />
          </Grid>
        </Grid>
      </div>
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
          <Grid item>{richTextEditor}</Grid>
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
          <Grid item sm={1}>
            {leftGutter}
          </Grid>
          <Grid item sm={11}>
            {postDetails}
          </Grid>
        </Grid>
      </>
    );

    useImperativeHandle(ref, () => ({
      blurTitle: () => documentTitleRef.current?.blurEditor(),
      blurBody: () => richTextEditorRef.current?.blurEditor(),
    }));

    return (
      <BasePostView
        readOnly={props.readOnly}
        postView={postView}
        mentions={props.mentions}
      />
    );
  }
);

type PostViewControllerProps = {
  viewer: UserRecord;
  getUser: GetUserFn;
  getPost: (uid: UserId, postId: PostId) => Promise<PostRecord | undefined>;
  getGlobalMentions: GetAllPostsByTitlePrefixFn;
  renamePost: RenamePostFn;
  syncBody: SyncBodyFn;
  createPost: CreatePostFn;
  getMentionUserPosts: GetMentionUserPostsFn;
};

type PostViewControllerParams = {
  authorId: UserId;
  postId: PostId;
};

export const PostViewController = (props: PostViewControllerProps) => {
  const logger = log.getLogger("PostViewController");
  const classes = useStyles();

  const { authorId, postId } = useParams<PostViewControllerParams>();
  const readOnly = props.viewer.uid !== authorId;

  const [title, setTitle] = useState<PostTitle>("");
  const [body, setBody] = useState<PostBody>(EMPTY_RICH_TEXT);
  const [mentionPosts, setMentionPosts] = useState<UserPost[]>([]);

  const [postRecordLoaded, setPostRecordLoaded] = useState(false);
  const [postRecordNotFound, setPostRecordNotFound] = useState(false);

  const [authorUserRecord, setAuthorUserRecord] = useState<
    UserRecord | undefined
  >(undefined);

  const [authorUserRecordLoaded, setAuthorUserRecordLoaded] = useState(false);

  const [mentionables, onMentionSearchChanged, onMentionAdded] = useMentions(
    props.getGlobalMentions,
    props.createPost,
    authorId,
    authorUserRecord?.username || ""
  );

  const mentions = findMentionsInPosts(mentionPosts, postId);

  const postViewRef = useRef<PostViewImperativeHandle>(null);

  // Attempt to load post
  // TODO: Encapsulate this in a use*-style hook
  useEffect(() => {
    let isSubscribed = true; // used to prevent state updates on unmounted components

    const loadPostRecord = async () => {
      const postRecord = await props.getPost(authorId, postId);
      const newMentionPosts = await props.getMentionUserPosts(postId);
      const postRecordNotFound = !postRecord;

      if (!isSubscribed) {
        return;
      }

      setPostRecordLoaded(true);
      setPostRecordNotFound(postRecordNotFound);
      setMentionPosts(newMentionPosts);

      if (postRecordNotFound) {
        logger.info(`Post ${postId} for author ${authorId} not found.`);
      } else {
        // when navigating from PostView to another PostView, we need to remove
        // focus from the title and body when loading in the destination title
        // and body because using the source cursor position may be unexpected
        // for the user and it may not even be a valid cursor position.
        postViewRef.current?.blurTitle();
        postViewRef.current?.blurBody();
        setTitle(postRecord!.title);
        setBody(postRecord!.body);
      }
    };
    loadPostRecord();
    return () => {
      isSubscribed = false;
    };
  }, [authorId, postId, logger, postRecordNotFound, props]);

  useEffect(() => {
    let isSubscribed = true; // used to prevent state updates on unmounted components
    const loadAuthorUserRecord = async () => {
      const authorUserRecord = await props.getUser(authorId);
      if (isSubscribed) {
        setAuthorUserRecord(authorUserRecord);
        setAuthorUserRecordLoaded(true);
      }
    };
    loadAuthorUserRecord();
    return () => {
      isSubscribed = false;
    };
  }, [authorId, props]);

  if (!postRecordLoaded || !authorUserRecordLoaded) {
    return <CircularProgress className={classes.loadingIndicator} />;
  } else if (postRecordNotFound) {
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

  const pageTitle = `${title!} by ${
    authorUserRecord.uid === props.viewer.uid
      ? "you"
      : authorUserRecord.username
  }`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <PostView
        ref={postViewRef}
        viewer={props.viewer}
        author={authorUserRecord}
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
        onMentionSearchChanged={onMentionSearchChanged}
        onMentionAdded={onMentionAdded}
        mentionableElementFn={mentionableElementFn(authorUserRecord.uid)}
      />
    </>
  );
};
