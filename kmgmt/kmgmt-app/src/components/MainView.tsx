import React from "react";
import Typography from "@material-ui/core/Typography";
import * as log from "loglevel";
import { Database, NoteRecord } from "../services/Database";
import { Container } from "@material-ui/core";
import { Link } from "react-router-dom";

export default function MainView(props: { database: Database }) {
  const logger = log.getLogger("MainView");
  const [notes, setNotes] = React.useState<NoteRecord[]>([]);
  const { database } = props;

  React.useEffect(() => {
    const loadNotes = async () => {
      logger.debug("fetching notes");
      const notes = await database.getNotes("agrodellic@gmail.com");
      setNotes(notes);
      logger.debug("loaded notes");
    };
    loadNotes();
  }, [database, logger]);

  return (
    <Container maxWidth="md">
      <Typography variant="body1">
        <Link to="notes/dummy-note">
          Dummy note:
          <b>{notes.length ? notes[0].body : "couldnt find any notes"}</b>
        </Link>
      </Typography>
    </Container>
  );
}
