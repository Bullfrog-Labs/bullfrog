import React, { useState, useContext, SetStateAction, Dispatch } from "react";
import { Database } from "../services/Database";
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
  saveNote: (richTextState: RichTextState) => boolean;
  richTextState: RichTextState;
  setRichTextState: Dispatch<SetStateAction<RichTextState>>;
};

type NoteViewProps = {
  database: Database;
};

function BaseNoteView(props: BaseNoteViewProps) {
  const logger = log.getLogger("BaseNoteView");
  const [noteChanged, setNoteChanged] = useState(false);

  const { richTextState, setRichTextState } = props;

  const handleOnIdle = (event: Event) => {
    logger.info("User idle");
    if (noteChanged) {
      logger.info("Note changed, saving");
      props.saveNote(richTextState);
      setNoteChanged(false);
    } else {
      logger.info("Note unchanged, not saving");
    }
  };

  const onTitleChange = (newTitle: Title): void => {
    setNoteChanged(newTitle != richTextState.title);
    setRichTextState({
      title: newTitle,
      body: richTextState.body,
    });
  };
  const onBodyChange = (newBody: Body): void => {
    setRichTextState({ title: richTextState.title, body: newBody });
    setNoteChanged(true);
  };

  return (
    <Container maxWidth="md">
      <IdleTimer timeout={IDLE_TIME_FOR_SAVE} onIdle={handleOnIdle}>
        <RichTextEditor
          onTitleChange={onTitleChange}
          onBodyChange={onBodyChange}
          enableToolbar={false}
        />
      </IdleTimer>
    </Container>
  );
}

export function CreateNewNoteView(props: NoteViewProps) {
  const logger = log.getLogger("CreateNewNoteView");
  const authState = useContext(AuthContext);

  const [richTextState, setRichTextState] = useState<RichTextState>(
    EMPTY_RICH_TEXT_STATE
  );

  const saveNote = (richTextState: RichTextState) => {
    // The note does not yet have an id.
    if (richTextState == EMPTY_RICH_TEXT_STATE) {
      // TODO: this works for create-new-note. Need to make sure it makes sense
      // for existing note.
      logger.info("Not saving empty note");
      return false;
    }

    logger.info("Saving new note");
    props.database.addNote(authState.email, richTextState);

    // TODO: How to transition to regular note after saving?

    return true;
  };

  return (
    <BaseNoteView
      {...props}
      saveNote={saveNote}
      richTextState={richTextState}
      setRichTextState={setRichTextState}
    />
  );
}

export function NoteView(props: NoteViewProps) {
  const logger = log.getLogger("NoteView");
  const authState = useContext(AuthContext);
  const { id } = useParams();

  const [noteLoaded, setNoteLoaded] = useState(false);
  const [richTextState, setRichTextState] = useState<RichTextState>(
    EMPTY_RICH_TEXT_STATE
  );

  // Add state for note loaded? and show spinner if not loaded

  const saveNote = (richTextState: RichTextState) => {
    logger.info(`Saving changes to note ${id}`);

    return true;
  };

  React.useEffect(() => {
    const loadNote = async () => {
      logger.debug(`fetching note ${id} for user ${authState.email}`);
      const note = await props.database.getNote(authState.email, id);
      setRichTextState({
        title: richTextState.title,
        body: richTextState.body,
      });
      setNoteLoaded(true);
      logger.debug(`loaded note ${id} for user ${authState.email}`);
    };
    loadNote();
  }, [props.database, logger, authState.email, id]);

  if (noteLoaded) {
    return (
      <BaseNoteView
        {...props}
        saveNote={saveNote}
        richTextState={richTextState}
        setRichTextState={setRichTextState}
      />
    );
  } else {
    return <CircularProgress />;
  }
}
