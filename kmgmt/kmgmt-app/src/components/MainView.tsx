import * as log from "loglevel";
import React, { useContext, useState } from "react";
import Typography from "@material-ui/core/Typography";
import { Database, NoteRecord } from "kmgmt-common";
import {
  Container,
  Grid,
  makeStyles,
  Button,
  Card,
  CardActionArea,
  Box,
} from "@material-ui/core";
import { AuthContext, AuthState } from "../services/Auth";
import { useHistory } from "react-router-dom";
import { richTextStringPreview } from "./richtext/Utils";

const useStyles = makeStyles((theme) => ({
  noteGrid: {
    "margin-top": theme.spacing(3),
  },
  card: {
    flexGrow: 1,
    maxHeight: 400,
    borderRadius: theme.spacing(1),
  },
  emptyNotePlaceholder: {
    color: "#80868b",
  },
}));

function NotePreviewCard(props: { note: NoteRecord }) {
  // eslint-disable-next-line
  const logger = log.getLogger("NotePreviewCard");
  const classes = useStyles();

  const { note } = props;
  const notePreview = richTextStringPreview(note.body);

  let noteLink: string;
  if (!!note.id) {
    noteLink = `/notes/${note.id}`;
  } else {
    // TODO: Convert the throw to an error boundary
    throw Error("Saved note should not have null id");
  }

  const history = useHistory();
  let navigateToNoteOnClick = () => {
    history.push(noteLink);
  };

  return (
    <Card
      className={classes.card}
      variant="elevation"
      onClick={navigateToNoteOnClick}
    >
      <CardActionArea className={classes.card}>
        <Box p={2}>
          {!!note.title && (
            <Typography variant="h6" component="h2">
              {note.title}
            </Typography>
          )}
          {!!notePreview && (
            <Typography variant="body2" component="p">
              {richTextStringPreview(note.body)}
            </Typography>
          )}
          {!note.title && !notePreview && (
            <Typography
              variant="h5"
              component="h2"
              className={classes.emptyNotePlaceholder}
            >
              Empty note
            </Typography>
          )}
        </Box>
      </CardActionArea>
    </Card>
  );
}

function NoteGrid(props: { notes: NoteRecord[] }) {
  // eslint-disable-next-line
  const logger = log.getLogger("NoteGrid");
  const classes = useStyles();

  const notePreviewCards = Array.from(props.notes.entries(), ([i, note]) => (
    <Grid item key={i} xs={12} sm={12} md={4} lg={3} xl={2}>
      <NotePreviewCard note={note} />
    </Grid>
  ));

  return (
    <Grid
      container
      direction="row"
      justify="flex-start"
      alignItems="flex-start"
      className={classes.noteGrid}
      spacing={2}
    >
      {notePreviewCards}
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
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const authState = useContext(AuthContext);
  const { database } = props;

  React.useEffect(() => {
    const checkIfUserExists = async () => {
      logger.debug(`checking whether user ${authState.email} exists`);
      const user = await database.getUser(authState.email);
      if (user) {
        logger.debug(`${authState.email} is an existing user`);
      } else {
        logger.debug(`${authState.email} is a new user, creating account`);
        await createNewAccount(database, authState);
      }
    };
    checkIfUserExists();
  }, [database, logger, authState]);

  React.useEffect(() => {
    const loadNotes = async () => {
      logger.debug(`fetching notes for user ${authState.email}`);
      const notes = await database.getNotes(authState.email);
      setNotes(notes);
      logger.debug(`loaded ${notes.length} notes`);
    };
    loadNotes();
  }, [database, logger, authState.email]);

  return (
    <Container maxWidth={false}>
      {notes.length > 0 ? (
        <NoteGrid notes={notes} />
      ) : (
        <EmptyNoteGridPlaceholder />
      )}
    </Container>
  );
}
