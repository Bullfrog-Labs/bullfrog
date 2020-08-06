import React from "react";
import Typography from "@material-ui/core/Typography";
import * as log from "loglevel";
import { Database, NoteRecord } from "../services/Database";

export default function MainView(props: { database: Database }) {
  const logger = log.getLogger("MainView");
  const [notes, setNotes] = React.useState<NoteRecord[]>([]);
  const { database } = props;

  React.useEffect(() => {
    const loadNotes = async () => {
      logger.debug("fetching notes");
      const notes = await database.getNotes();
      console.dir(notes);
      setNotes(notes);
      logger.debug("done");
    };
    loadNotes();
  }, [database, logger]);

  return (
    <React.Fragment>
      <Typography variant="h1">Welcome to kmgmt-app</Typography>
      <Typography variant="body1">
        Dummy note:{" "}
        <b>{notes.length ? notes[0].text : "couldnt find any notes"}</b>
      </Typography>
    </React.Fragment>
  );
}
