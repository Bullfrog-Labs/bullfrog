import React, { useState, useContext } from "react";
import { Database, NoteID } from "kmgmt-common";
import { Container, CircularProgress, makeStyles } from "@material-ui/core";
import { useParams, useHistory } from "react-router-dom";
import RichTextEditor, {
  Title,
  Body,
  EMPTY_RICH_TEXT_STATE,
} from "./richtext/RichTextEditor";
import IdleTimer from "react-idle-timer";
import * as log from "loglevel";
import { AuthContext } from "../services/Auth";
import { RichText } from "./richtext/Types";

const useStyles = makeStyles((theme) => ({
  noteView: {
    "margin-top": theme.spacing(5),
  },
  loadingIndicator: {
    position: "fixed",
    top: "30%",
    left: "50%",
  },
}));

const IDLE_TIME_FOR_SAVE = 1 * 1000;

type BaseNoteViewProps = {
  title: Title;
  body: Body;
  onTitleChange: (newTitle: Title) => void;
  onBodyChange: (newBody: Body) => void;
  saveNote: () => Promise<boolean>;
  readOnly?: boolean;
};

type NoteViewProps = {
  database: Database;
  readOnly?: boolean;
};

function BaseNoteView(props: BaseNoteViewProps) {
  const logger = log.getLogger("BaseNoteView");
  const [noteChanged, setNoteChanged] = useState(false);

  const classes = useStyles();

  const handleOnIdle = (event: Event) => {
    logger.info("User idle");
    if (noteChanged) {
      // saveNote will only be called when the note has actually been changed
      logger.info("Note changed, saving");
      props.saveNote();
      setNoteChanged(false);
    } else {
      logger.info("Note unchanged, not saving");
    }
  };

  const onTitleChange = (newTitle: Title): void => {
    setNoteChanged(newTitle !== props.title);
    props.onTitleChange(newTitle);
  };
  const onBodyChange = (newBody: Body): void => {
    setNoteChanged(true);
    props.onBodyChange(newBody);
  };

  return (
    <Container className={classes.noteView} maxWidth="md">
      <IdleTimer timeout={IDLE_TIME_FOR_SAVE} onIdle={handleOnIdle}>
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
}

export function CreateNewNoteView(props: NoteViewProps) {
  // The note does not yet have an id.
  const logger = log.getLogger("CreateNewNoteView");
  const authState = useContext(AuthContext);

  const [readOnly, setReadOnly] = useState(false);
  const [title, setTitle] = useState(EMPTY_RICH_TEXT_STATE.title);
  const [body, setBody] = useState<Body>(EMPTY_RICH_TEXT_STATE.body);

  const history = useHistory();

  const saveNote = async () => {
    logger.info("Saving new note");
    setReadOnly(true);

    let noteID: NoteID = await props.database.addNote(authState.email, {
      title: title,
      body: body,
    });

    logger.info(`Saved new note with id ${noteID}`);

    // do redirect to permanent note url
    history.replace(`/notes/${noteID}`);

    return true;
  };

  return (
    <BaseNoteView
      {...props}
      readOnly={!!props.readOnly || readOnly}
      title={title}
      body={body}
      onTitleChange={setTitle}
      onBodyChange={setBody}
      saveNote={saveNote}
    />
  );
}

interface NoteViewParams {
  id: NoteID;
}

export function NoteView(props: NoteViewProps) {
  const logger = log.getLogger("NoteView");
  const authState = useContext(AuthContext);
  const { id } = useParams<NoteViewParams>();

  const [noteLoaded, setNoteLoaded] = useState(false);
  const [title, setTitle] = useState(EMPTY_RICH_TEXT_STATE.title);
  const [body, setBody] = useState<Body>(EMPTY_RICH_TEXT_STATE.body);

  const saveNote = async () => {
    logger.info(`Saving changes to note ${id}`);

    props.database.updateNote(authState.email, id, {
      title: title,
      body: body,
    });

    return true;
  };

  React.useEffect(() => {
    const loadNote = async () => {
      logger.debug(`fetching note ${id} for user ${authState.email}`);
      const note = await props.database.getNote(authState.email, id);
      if (!!note) {
        setTitle(note.title ?? "");
        setBody(note.body as RichText);
      } else {
        // TODO: handle note not found
        logger.debug(`Note ${id} not found during load`);
      }
      setNoteLoaded(true);
      logger.debug(`loaded note ${id} for user ${authState.email}`);
    };
    loadNote();
  }, [props.database, logger, authState.email, id]);

  const styles = useStyles();

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
    return <CircularProgress className={styles.loadingIndicator} />;
  }
}
