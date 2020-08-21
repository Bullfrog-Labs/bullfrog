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
  useTheme,
  Theme,
} from "@material-ui/core";
import { AuthContext, AuthState } from "../services/Auth";
import { useHistory } from "react-router-dom";
import { richTextStringPreview } from "./richtext/Utils";

/*
// import { Responsive as ResponsiveGridLayout } from "react-grid-layout";
import { Responsive, WidthProvider } from "react-grid-layout";
*/

import { Layout } from "react-grid-layout";
import { Breakpoint } from "@material-ui/core/styles/createBreakpoints";

import GridLayout from "react-grid-layout";

import sizeMe from "react-sizeme";

// export const BREAK = ["bold", "italic", "underline", "code"] as const;

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

function buildNotePreviewCard(note: NoteRecord, theme: Theme) {
  const notePreview = richTextStringPreview(note.body);

  let noteHeight = 0;
  if (!note.title && !notePreview) {
    // empty card
    noteHeight += theme.spacing(4);
  } else {
    if (!!note.title) {
      noteHeight += Math.ceil(note.title.length / 35) * theme.spacing(4);
    }
    if (!!notePreview) {
      noteHeight += Math.ceil(notePreview.length / 50) * theme.spacing(2.5);
    }
  }

  // noteHeight = Math.min(noteHeight, 400);

  return [<NotePreviewCard note={note} />, noteHeight];
}

function NotePreviewCard(props: { note: NoteRecord }) {
  // eslint-disable-next-line
  const logger = log.getLogger("NotePreviewCard");
  const classes = useStyles();
  const theme = useTheme();

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
    // history.push(noteLink);
  };

  let padding = 2;

  let noteHeight = theme.spacing(4) + theme.spacing(padding * 2); // min height, including padding
  if (!!note.title) {
    noteHeight += Math.floor(note.title.length / 24) * theme.spacing(1);
  }
  if (!!notePreview) {
    noteHeight += Math.floor(notePreview.length / 40) * theme.spacing(0.5);
  }

  return (
    <Card
      className={classes.card}
      variant="elevation"
      onClick={navigateToNoteOnClick}
    >
      <CardActionArea className={classes.card}>
        <Box p={padding}>
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

const SizeAwareGridItem = sizeMe({
  monitorHeight: true,
})((props: { key: string; children: React.ReactNode }) => (
  <div key={props.key}>{props.children}</div>
));

function NoteGrid(props: { notes: NoteRecord[] }) {
  // const ResponsiveGridLayout = WidthProvider(Responsive);
  // eslint-disable-next-line
  const logger = log.getLogger("NoteGrid");
  const classes = useStyles();
  const theme = useTheme();

  const [noteSizes, setNoteSizes] = useState({});

  type ResponsiveLayout = {
    [key in Breakpoint]: Layout[];
  };

  // generate layouts
  const cols = { xl: 20, lg: 16, md: 12, sm: 4, xs: 4 };

  const onSize = (key: string) => (size) => {
    noteSizes[key] = size;
    setNoteSizes(noteSizes);
    console.log(`Got onSize for ${key} with height ${size.height}`);
  };

  const generateLayouts = (
    notes: NoteRecord[]
  ): [ResponsiveLayout, NotePreviewCard[]] => {
    const result = Array.from(props.notes.entries(), ([i, note]) => {
      // const key: string = !!note.id ? note.id : i;
      const key: string = String(i);

      let [foo, noteHeight] = buildNotePreviewCard(note, theme);

      if (key in noteSizes) {
        console.log(`Found actual size for ${key}: ${noteSizes[key].height}`);
        noteHeight = noteSizes[key].height;
      }

      const notePreviewCard = (
        <div key={key}>
          <SizeAwareGridItem key={key} onSize={onSize(key)}>
            {noteHeight}
            {foo}
          </SizeAwareGridItem>
        </div>
      );
      // layout below is compute with respect to xl (largest) breakpoint
      // TODO: Need to determine note height
      // Use constant note width
      const defaultWidth = 4;
      // Math.ceil(noteHeight / theme.spacing(1)),
      const hackyHacks =
        Math.ceil((noteHeight - theme.spacing(1)) / (theme.spacing(1) + 10)) +
        1;
      const layout = {
        i: key,
        x: (i * defaultWidth) % cols.xl,
        y: Infinity,
        w: defaultWidth,
        h: hackyHacks,
        // h: 1,
      };

      console.log([
        !!note.title ? note.title : "Empty note",
        noteHeight,
        Math.ceil(noteHeight / theme.spacing(1)),
      ]);

      return [layout, notePreviewCard];
    });

    return [{ xl: result.map((x) => x[0]) }, result.map((x) => x[1])];
  };

  // generate grid items (note preview cards)

  const [layouts, notePreviewCards] = generateLayouts(props.notes);

  // generate grid

  return (
    <GridLayout
      layout={layouts.xl}
      cols={20}
      width={1920}
      rowHeight={theme.spacing(1)}
    >
      {notePreviewCards}
    </GridLayout>
  );
  /*
  return (
    <ResponsiveGridLayout
      layouts={layouts}
      breakpoints={theme.breakpoints.values}
      cols={cols}
      measureBeforeMount={false}
    >
      {notePreviewCards}
    </ResponsiveGridLayout>
  );
  */

  /*
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
    */
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
