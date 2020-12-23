import React, { useState } from "react";
import RichTextEditor, {
  Body,
  Title,
} from "../components/richtext/RichTextEditor";
import * as log from "loglevel";
import { UserRecord } from "../services/store/Users";
import { Container, CircularProgress, makeStyles } from "@material-ui/core";
import IdleTimer from "react-idle-timer";

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

export type PostID = string;

export type PostRecord = {
  id: PostID;
  author: UserRecord;
  title: Title;
  body: Body;
};

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

  if (props.readOnly) {
    logger.info(
      `rendering read-only view for ${props.postRecord.author}/${props.postRecord.title}`
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

export type RenamePostResult = "success" | "post-name-taken";

// const renamePost: async () => RenamePostResult = () => {};

export type SyncBodyResult = "success" | "failure";

// const syncBody: async () => SyncBodyResult = () => {};

interface CreateNewPostViewProps extends BasePostViewProps {
  prepopulatedTitle?: Title;
}

const CreateNewPostView = (props: CreateNewPostViewProps) => {
  // Need to be able to pre-populate title, or have empty title.
  // Changing title triggers a rename. Save note on idle if the title or body is changed.
  const logger = log.getLogger("CreateNewPostView");
};

export type PostViewProps = {
  readOnly?: boolean;
  postRecord: PostRecord;

  getTitle: (postId: PostID) => Promise<Title>;

  onTitleChange: (newTitle: Title) => void;
  onBodyChange: (newBody: Body) => void;

  renamePost: (newTitle: Title) => Promise<RenamePostResult>;
  syncBody: (newBody: Body) => Promise<SyncBodyResult>;
};

export const PostView = (props: PostViewProps) => {
  // Changing title triggers a rename. Renames are not allowed if the title is
  // already being used.
  const logger = log.getLogger("PostView");
  const [titleChanged, setTitleChanged] = useState(false);
  const [bodyChanged, setBodyChanged] = useState(false);

  log.setLevel("trace");

  const { renamePost, syncBody, ...basePostViewProps } = props;

  const onTitleChange = (newTitle: Title) => {
    if (newTitle !== props.postRecord.title) {
      setTitleChanged(true);
      props.onTitleChange(newTitle);
    }
  };
  basePostViewProps.onTitleChange = onTitleChange;

  const onBodyChange = (newBody: Body) => {
    // TODO: Only mark body as changed if it is actually different
    setBodyChanged(true);
    props.onBodyChange(newBody);
  };
  basePostViewProps.onBodyChange = onBodyChange;

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
        props.postRecord.title
      );

      if (renamePostResult === "success") {
        logger.info(`Post renamed to ${props.postRecord.title}`);
        setTitleChanged(false);
        // TODO: Display something to show the user that the rename succeeded
      } else if (renamePostResult === "post-name-taken") {
        const savedTitle = await props.getTitle(props.postRecord.id); // this should be pulled from DB
        logger.info(
          `Post rename failed, ${props.postRecord.title} already taken. Reverting to saved title ${savedTitle}`
        );
        props.onTitleChange(savedTitle);
        setTitleChanged(false);
        // TODO: Display something to show the user that the rename failed due
        // to the new name already being taken.
      } else {
        throw Error("Unknown return value from renamePost");
      }
    }
  };

  return <BasePostView onIdle={onIdle} {...basePostViewProps} />;
};
