import React, { useState, useContext } from "react";
import Typography from "@material-ui/core/Typography";
import { Database } from "../services/Database";
import { Container } from "@material-ui/core";
import { useParams, useLocation } from "react-router-dom";
import RichTextEditor, {
  RichTextState,
  Field,
} from "./richtext/RichTextEditor";
import IdleTimer from "react-idle-timer";
import * as log from "loglevel";
import { AuthContext } from "../services/Auth";

import { EMPTY_RICH_TEXT } from "./richtext/Utils";

type NoteViewProps = {
  database: Database;
};

const IDLE_TIME_FOR_SAVE = 5 * 1000;

export function CreateNewNoteView(props: NoteViewProps) {
  // The note does not yet have an id.
  const authState = useContext(AuthContext);

  const logger = log.getLogger("CreateNewNoteView");

  const [noteChanged, setNoteChanged] = useState(false);
  const [richTextState, setRichTextState] = useState<RichTextState>({
    body: EMPTY_RICH_TEXT,
  });

  const saveNote = () => {
    if (!richTextState) {
      logger.info("Not saving empty note");
      return;
    }

    const noteRecord = {
      title: richTextState.title,
      body: richTextState.body ?? EMPTY_RICH_TEXT,
    };

    props.database.addNote(authState.email, noteRecord);
  };

  const handleOnIdle = (event: Event) => {
    logger.info("User idle");
    if (noteChanged) {
      logger.info("Note changed, saving");
      saveNote();
      setNoteChanged(false);
    } else {
      logger.info("Note unchanged, not saving");
    }
  };

  const onStateChange = (
    changedState: RichTextState,
    updatedFields: Field[]
  ) => {
    let noteChanged = false;
    if (updatedFields.includes("title")) {
      // noteChanged = changedState.title != richTextState.title;
    }

    if (updatedFields.includes("body")) {
      // noteChanged = true;
    }

    setRichTextState(changedState);
    setNoteChanged(noteChanged);
  };

  return (
    <Container maxWidth="md">
      <IdleTimer timeout={IDLE_TIME_FOR_SAVE} onIdle={handleOnIdle}>
        <RichTextEditor onStateChange={onStateChange} enableToolbar={false} />
      </IdleTimer>
    </Container>
  );
}

export default function NoteView(props: NoteViewProps) {
  const logger = log.getLogger("NoteView");
  const { id } = useParams();

  // logger.info(`NoteView at ${location}`);

  // TODO: Update id if missing and redirect (i.e. for a new note)

  return <Container maxWidth="md">{/* 
      <RichTextEditor />
*/}</Container>;
}
