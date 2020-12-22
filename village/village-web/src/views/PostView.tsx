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

// usePostState

export type BasePostViewProps = {
  title: Title;
  body: Body;
  author: UserRecord;

  readOnly?: boolean;

  idleTime?: number;

  onTitleChange: (newTitle: Title) => void;
  onBodyChange: (newBody: Body) => void;
  handleOnIdle: (event: Event) => void;
};

export const BasePostView = (props: BasePostViewProps) => {
  const logger = log.getLogger("BasePostView");
  const classes = useStyles();

  if (props.readOnly) {
    logger.info(`rendering read-only view for ${props.author}/${props.title}`);

    return (
      <Container className={classes.postView} maxWidth="md">
        <RichTextEditor
          readOnly={true}
          title={props.title}
          onTitleChange={(_: Title) => {}}
          body={props.body}
          onBodyChange={(_: Body) => {}}
          enableToolbar={false}
        />
      </Container>
    );
  }

  const [titleChanged, setTitleChanged] = useState(false);
  const [bodyChanged, setBodyChanged] = useState(false);

  // only record the title as changed if it is actually different
  const onTitleChange = (newTitle: Title): void => {
    setTitleChanged(newTitle !== props.title);
    props.onTitleChange(newTitle);
  };

  // TODO: only record the body as changed if it is actually different
  const onBodyChange = (newBody: Body): void => {
    setBodyChanged(true);
    props.onBodyChange(newBody);
  };

  return (
    <Container className={classes.postView} maxWidth="md">
      <IdleTimer
        timeout={props.idleTime ?? DEFAULT_IDLE_TIME}
        onIdle={props.handleOnIdle}
      >
        <RichTextEditor
          readOnly={props.readOnly ?? false}
          title={props.title}
          onTitleChange={onTitleChange}
          body={props.body}
          onBodyChange={onBodyChange}
          enableToolbar={false}
        />
      </IdleTimer>
    </Container>
  );
};
