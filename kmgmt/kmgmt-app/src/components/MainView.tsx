import React from "react";
import Typography from "@material-ui/core/Typography";
import * as log from "loglevel";
import { Database, NoteRecord } from "../services/Database";
import { Container, Grid, Paper, makeStyles } from "@material-ui/core";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

function NoteColumn(props: { notes: NoteRecord[] }) {
  const classes = useStyles();
  const items = props.notes.map((note: NoteRecord) => {
    return (
      <Grid item xs={12}>
        <Paper className={classes.paper}>
          <Typography variant="body1">{note.body}</Typography>
        </Paper>
      </Grid>
    );
  });
  return (
    <Grid container item xs={4} spacing={1} justify="flex-start">
      {items}
    </Grid>
  );
}

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

  const lengths: number[] = [0, 0, 0];
  const columns: NoteRecord[][] = [[], [], []];
  notes.forEach((note) => {
    const i = lengths.indexOf(Math.min(...lengths));
    columns[i].push(note);
    lengths[i] = lengths[i] + note.body.length;
  });

  return (
    <Container maxWidth="md">
      <Grid container spacing={1} justify="flex-start">
        <NoteColumn notes={columns[0]} />
        <NoteColumn notes={columns[1]} />
        <NoteColumn notes={columns[2]} />
      </Grid>
    </Container>
  );
}
