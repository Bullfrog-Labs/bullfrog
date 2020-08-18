import React, { useState, useContext, SetStateAction, Dispatch } from "react";
import { Database, NoteRecord } from "../services/Database";
import { Container, CircularProgress } from "@material-ui/core";
import { useParams } from "react-router-dom";
import RichTextEditor, {
  Title,
  Body,
  RichTextState,
  EMPTY_RICH_TEXT_STATE,
} from "./richtext/RichTextEditor";
import IdleTimer from "react-idle-timer";
import * as log from "loglevel";
import { AuthContext } from "../services/Auth";

const IDLE_TIME_FOR_SAVE = 1 * 1000;

type BaseNoteViewProps = {
  title: Title;
  body: Body;
  onTitleChange: (newTitle: Title) => void;
  onBodyChange: (newBody: Body) => void;
  saveNote: () => boolean;
};

type NoteViewProps = {
  database: Database;
};

function BaseNoteView(props: BaseNoteViewProps) {
  const logger = log.getLogger("BaseNoteView");
  const [noteChanged, setNoteChanged] = useState(false);

  const handleOnIdle = (event: Event) => {
    logger.info("User idle");
    if (noteChanged) {
      logger.info("Note changed, saving");
      props.saveNote();
      setNoteChanged(false);
    } else {
      logger.info("Note unchanged, not saving");
    }
  };

  const onTitleChange = (newTitle: Title): void => {
    setNoteChanged(newTitle != props.title);
    props.onTitleChange(newTitle);
  };
  const onBodyChange = (newBody: Body): void => {
    setNoteChanged(true);
    props.onBodyChange(newBody);
  };

  return (
    <Container maxWidth="md">
      <IdleTimer timeout={IDLE_TIME_FOR_SAVE} onIdle={handleOnIdle}>
        <RichTextEditor
          title={props.title}
          onTitleChange={onTitleChange}
          body={props.body}
          onBodyChange={onBodyChange}
          enableToolbar={false}
        />
      </IdleTimer>
    </Container>
  );
}

export function CreateNewNoteView(props: NoteViewProps) {
  // The note does not yet have an id.
  const logger = log.getLogger("CreateNewNoteView");
  const authState = useContext(AuthContext);

  const [noteEdited, setNoteEdited] = useState(false);
  const [title, setTitle] = useState(EMPTY_RICH_TEXT_STATE.title);
  const [body, setBody] = useState<Body>(EMPTY_RICH_TEXT_STATE.body);

  const saveNote = () => {
    if (!noteEdited) {
      logger.info("Not saving empty note");
      return false;
    }

    logger.info("Saving new note");
    props.database.addNote(authState.email, {
      title: title,
      body: body,
    });

    // TODO: How to transition to regular note after saving?

    return true;
  };

  const onTitleChange = (newTitle: Title) => {
    setTitle(newTitle);
    setNoteEdited(true);
  };

  const onBodyChange = (newBody: Body) => {
    setBody(newBody);
    setNoteEdited(true);
  };

  return (
    <BaseNoteView
      {...props}
      title={title}
      body={body}
      onTitleChange={onTitleChange}
      onBodyChange={onBodyChange}
      saveNote={saveNote}
    />
  );
}

export function NoteView(props: NoteViewProps) {
  const logger = log.getLogger("NoteView");
  const authState = useContext(AuthContext);
  const { id } = useParams();

  const [noteLoaded, setNoteLoaded] = useState(false);
  const [title, setTitle] = useState(EMPTY_RICH_TEXT_STATE.title);
  const [body, setBody] = useState<Body>(EMPTY_RICH_TEXT_STATE.body);

  // Add state for note loaded? and show spinner if not loaded

  const saveNote = () => {
    logger.info(`Saving changes to note ${id}`);

    return true;
  };

  React.useEffect(() => {
    const loadNote = async () => {
      logger.debug(`fetching note ${id} for user ${authState.email}`);
      const note = await props.database.getNote(authState.email, id);
      if (!!note) {
        setTitle(note.title ?? "");
        setBody(note.body);
      } else {
        // TODO: handle note not found
      }
      setNoteLoaded(true);
      logger.debug(`loaded note ${id} for user ${authState.email}`);
    };
    loadNote();
  }, [props.database, logger, authState.email, id]);

  if (noteLoaded) {
    return (
      <BaseNoteView
        {...props}
        title={title}
        body={body}
        onTitleChange={setTitle}
        onBodyChange={setBody}
        saveNote={saveNote}
      />
    );
  } else {
    return <CircularProgress />;
  }
}
