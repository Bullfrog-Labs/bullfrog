import React, { useContext } from "react";
import Typography from "@material-ui/core/Typography";
import * as log from "loglevel";
import { Database, NoteRecord } from "../services/Database";
import { Container, Grid, Paper, makeStyles, Button } from "@material-ui/core";
import { AuthContext, AuthState } from "../services/Auth";
import { useHistory } from "react-router-dom";
import { richTextStringPreview } from "./richtext/Utils";
import { database } from "firebase";

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
    // TODO: note body length does not make sense with rich text. Fix this.
    lengths[i] = lengths[i] + note.body.length;
  });
  return columns;
}

function NotePreviewCard(props: { note: NoteRecord }) {
  const logger = log.getLogger("NotePreviewCard");
  const classes = useStyles();

  const { note } = props;
  const notePreview = richTextStringPreview(note.body);

  return (
    <Grid item xs={12}>
      <Paper className={classes.paper}>
        {!!note.title && <Typography variant="h6">{note.title}</Typography>}
        {!!notePreview && (
          <Typography variant="body1">
            {richTextStringPreview(note.body)}
          </Typography>
        )}
      </Paper>
    </Grid>
  );
}

function NoteColumn(props: { notes: NoteRecordColumn }) {
  // eslint-disable-next-line
  const logger = log.getLogger("NoteColumn");

  const items = props.notes.map((note: NoteRecord, index: number) => {
    return <NotePreviewCard key={index} note={note} />;
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
    <NoteColumn key={i} notes={column} />
  ));

  return (
    <Grid container className={classes.noteGrid} spacing={1}>
      {noteColumns}
    </Grid>
  );
}

function EmptyNoteGridPlaceholder() {
  let history = useHistory();
  let createNewNoteOnClick = () => {
    history.push("/create-new-note");
  };
  return (
    <Button variant="contained" color="primary" onClick={createNewNoteOnClick}>
      Create your first note
    </Button>
  );
}

async function createNewAccount(database: Database, authState: AuthState) {
  const logger = log.getLogger("MainView::createNewAccount");
  const newUserRecord = { userName: authState.email };
  logger.debug(`adding user ${newUserRecord.userName}`);
  await database.addUser(newUserRecord);
  logger.debug(`added user ${newUserRecord.userName}`);
}

export default function MainView(props: { database: Database }) {
  const logger = log.getLogger("MainView");
  const [notes, setNotes] = React.useState<NoteRecord[]>([]);
  const [newUser, setNewUser] = React.useState(true);
  const authState = useContext(AuthContext);
  const { database } = props;

  React.useEffect(() => {
    const checkIfUserExists = async () => {
      logger.debug(`checking whether user ${authState.email} exists`);
      const user = await database.getUser(authState.email);
      setNewUser(!user);
      if (user) {
        logger.debug(`${authState.email} is an existing user`);
      } else {
        logger.debug(`${authState.email} is a new user, creating account`);
        await createNewAccount(database, authState);
      }
    };
    checkIfUserExists();
  }, [database, logger, authState.email]);

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
