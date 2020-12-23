import React, { useEffect, useState } from "react";
import RichTextEditor, {
  Body,
  Title,
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
} from "../services/store/Posts";
import { UserId, UserRecord } from "../services/store/Users";
import { Redirect, useParams } from "react-router-dom";

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
  readOnly?: boolean;

  postRecord: PostRecord;

  onTitleChange: (newTitle: Title) => void;
  onBodyChange: (newBody: Body) => void;
  onIdle: (event: Event) => void;
};

export const BasePostView = (props: BasePostViewProps) => {
  const logger = log.getLogger("BasePostView");
  const classes = useStyles();

  if (props.readOnly === undefined) {
    props.readOnly = true;
  }

  if (props.readOnly) {
    logger.info(
      `rendering read-only view for ${props.postRecord.authorId}/${props.postRecord.title}`
    );

    return (
      <Container className={classes.postView} maxWidth="md">
        <RichTextEditor
          readOnly={true}
          title={props.postRecord.title}
          onTitleChange={(_: Title) => {}}
          body={props.postRecord.body}
          onBodyChange={(_: Body) => {}}
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
          title={props.postRecord.title}
          onTitleChange={props.onTitleChange}
          body={props.postRecord.body}
          onBodyChange={props.onBodyChange}
          enableToolbar={false}
        />
      </IdleTimer>
    </Container>
  );
};

interface CreateNewPostViewProps extends BasePostViewProps {
  prepopulatedTitle?: Title;
  createPost: CreatePostFn;
}

const CreateNewPostView = (props: CreateNewPostViewProps) => {
  // Need to be able to pre-populate title, or have empty title.
  // Changing title triggers a rename. Save note on idle if the title or body is
  // changed. No saving on blank title.
  const logger = log.getLogger("CreateNewPostView");
  const [postHasTitle, setPostHasTitle] = useState(
    !!props.prepopulatedTitle || false
  );
  const [postHasBody, setPostHasBody] = useState(false);

  // TODO: Construct PostRecord

  const onIdle = async (event: Event) => {};

  /*
  return <BasePostView onIdle={onIdle} />;
  */
};

export type PostViewProps = {
  readOnly?: boolean;
  postRecord: PostRecord;

  getTitle: () => Promise<Title | undefined>;

  renamePost: RenamePostFn;
  syncBody: SyncBodyFn;
};

// TODO: Implement code to load the post data into the PostView
export const PostView = (props: PostViewProps) => {
  // Changing title triggers a rename. Renames are not allowed if the title is
  // already being used.
  const logger = log.getLogger("PostView");
  const [titleChanged, setTitleChanged] = useState(false);
  const [bodyChanged, setBodyChanged] = useState(false);

  const { renamePost, syncBody, ...restProps } = props;

  const onIdle = async (event: Event) => {
    // TODO: Post should only be renamed if the user is idle and focus is not on
    // the title itself.
    // TODO: If the title is set to empty or blank, reset it back to the
    // original title
    const needsPostRename = titleChanged;

    // sync body first
    if (bodyChanged) {
      logger.debug("Body changed, syncing body");
      const syncBodyResult: SyncBodyResult = await syncBody(
        props.postRecord.id,
        props.postRecord.body
      );

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
        props.postRecord.id,
        props.postRecord.title
      );

      if (renamePostResult === "success") {
        logger.info(`Post renamed to ${props.postRecord.title}`);
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
          `Post rename failed, ${props.postRecord.title} already taken. Reverting to saved title ${savedTitle}`
        );

        props.postRecord.title = savedTitle;
        setTitleChanged(false);
        // TODO: Display something to show the user that the rename failed due
        // to the new name already being taken.
      } else {
        throw Error("Unknown return value from renamePost");
      }
    }
  };

  const onTitleChange = (newTitle: Title) => {
    if (newTitle !== props.postRecord.title) {
      setTitleChanged(true);
    }
  };

  const onBodyChange = (newBody: Body) => {
    // TODO: Only mark body as changed if it is actually different
    setBodyChanged(true);
  };

  return (
    <BasePostView
      onIdle={onIdle}
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

type PostViewParams = {
  authorId: UserId;
  postId: PostId;
};

export const PostViewController = (props: PostViewControllerProps) => {
  // Determine whether read-only
  const styles = useStyles();

  const { authorId, postId } = useParams<PostViewParams>();
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
  const getTitle: () => Promise<Title | undefined> = async () => {
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
