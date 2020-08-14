import React, { useContext } from "react";
import Typography from "@material-ui/core/Typography";
import * as log from "loglevel";
import { Database, NoteRecord } from "../services/Database";
import { Container, Grid, Paper, makeStyles } from "@material-ui/core";
import { AuthContext } from "../services/Auth";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  noteGrid: {
    "margin-top": theme.spacing(1),
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

type NoteRecordColumn = NoteRecord[];
type NoteRecordGrid = NoteRecordColumn[];

/**
 * Very simple dummy implementation for note layout. Lays notes out top to
 * bottom by always placing the next note in the smallest column.
 * @param notes
 */
function createNoteGrid(notes: NoteRecordColumn) {
  const lengths: number[] = [0, 0, 0];
  const columns: NoteRecordGrid = [[], [], []];
  notes.forEach((note) => {
    const i = lengths.indexOf(Math.min(...lengths));
    columns[i].push(note);
    lengths[i] = lengths[i] + note.body.length;
  });
  return columns;
}

function NoteColumn(props: { notes: NoteRecordColumn }) {
  // eslint-disable-next-line
  const logger = log.getLogger("NoteColumn");
  const classes = useStyles();
  const items = props.notes.map((note: NoteRecord, index: number) => {
    return (
      <Grid key={index} item xs={12}>
        <Paper className={classes.paper}>
          {!!note.title && <Typography variant="h6">{note.title}</Typography>}
          <Typography variant="body1">{note.body}</Typography>
        </Paper>
      </Grid>
    );
  });
  return (
    <Grid container item xs={4} spacing={1}>
      {items}
    </Grid>
  );
}

function NoteGrid(props: { columns: NoteRecordGrid }) {
  const logger = log.getLogger("NoteGrid");
  const classes = useStyles();

  const noteColumns = Array.from(props.columns.entries(), ([i, column]) => (
    <NoteColumn key={i} notes={column}></NoteColumn>
  ));

  return (
    <Grid container className={classes.noteGrid} spacing={1}>
      {noteColumns}
    </Grid>
  );
}

function EmptyNoteGridPlaceholder() {
  return <span>"No notes!"</span>;
}

export default function MainView(props: { database: Database }) {
  const logger = log.getLogger("MainView");
  const classes = useStyles();
  const [notes, setNotes] = React.useState<NoteRecord[]>([]);
  const authState = useContext(AuthContext);
  const { database } = props;

  React.useEffect(() => {
    const loadNotes = async () => {
      logger.debug(`fetching notes for user ${authState.email}`);
      const notes = await database.getNotes(authState.email);
      setNotes(notes);
      logger.debug(`loaded ${notes.length} notes`);
    };
    loadNotes();
  }, [database, logger, authState.email]);

  const columns = createNoteGrid(notes);

  return (
    <Container maxWidth="md">
      {notes.length > 0 ? (
        <NoteGrid columns={columns} />
      ) : (
        <EmptyNoteGridPlaceholder />
      )}
    </Container>
  );
}
