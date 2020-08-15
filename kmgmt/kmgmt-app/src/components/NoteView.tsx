import React, { useState, useContext } from "react";
import { Database } from "../services/Database";
import { Container } from "@material-ui/core";
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
  const [richTextState, setRichTextState] = useState<RichTextState>(
    EMPTY_RICH_TEXT_STATE
  );

  const saveNote = () => {
    if (richTextState == EMPTY_RICH_TEXT_STATE) {
      // TODO: this works for create-new-note. Need to make sure it makes sense
      // for existing note.
      logger.info("Not saving empty note");
      return;
    }

    const noteRecord = {
      title: richTextState.title,
      body: richTextState.body,
    };

    logger.info("Saving new note");
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

export default function NoteView(props: NoteViewProps) {
  const logger = log.getLogger("NoteView");
  const { id } = useParams();

  // logger.info(`NoteView at ${location}`);

  // TODO: Update id if missing and redirect (i.e. for a new note)

  return <Container maxWidth="md">{/* 
      <RichTextEditor />
*/}</Container>;
}
