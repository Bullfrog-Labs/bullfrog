import * as log from "loglevel";
import React, { useContext, useState } from "react";
import Typography from "@material-ui/core/Typography";
import { Database, NoteRecord } from "kmgmt-common";
import {
  Container,
  makeStyles,
  Button,
  Card,
  CardActionArea,
  Box,
  useTheme,
} from "@material-ui/core";
import { AuthContext, AuthState } from "../services/Auth";
import { useHistory } from "react-router-dom";
import { richTextStringPreview } from "./richtext/Utils";

import { Layout } from "react-grid-layout";
import { Breakpoint } from "@material-ui/core/styles/createBreakpoints";

import sizeMe, { SizeMeProps } from "react-sizeme";

import { Responsive, WidthProvider } from "react-grid-layout";

const ReactGridLayout = WidthProvider(Responsive);

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

function NotePreviewCard(props: { note: NoteRecord; height?: number }) {
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

  let padding = 2;

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
  const theme = useTheme();

  const [noteSizes, setNoteSizes] = useState<{
    [key: string]: SizeMeProps["size"];
  }>({});

  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>("xl");

  type ResponsiveLayout = {
    [key in Breakpoint]: Layout[];
  };

  const cols = { xl: 5, lg: 4, md: 3, sm: 1, xs: 1 };

  const onSize = (key: string) => (size: SizeMeProps["size"]) => {
    let newNoteSizes = { ...noteSizes };
    newNoteSizes[key] = size;
    setNoteSizes(newNoteSizes);
  };

  const heightToGridRows = (x: number) =>
    Math.ceil((x - theme.spacing(1)) / (theme.spacing(1) + 10)) + 1;

  const generateLayoutAndNotePreviews = (idx: number, note: NoteRecord) => {
    const key: string = !!note.id ? note.id : String(idx);
    const noteHeight = !!noteSizes[key]
      ? noteSizes[key].height ?? undefined
      : undefined;

    const notePreviewCard = (
      <div key={key}>
        <SizeAwareGridItem key={key} onSize={onSize(key)}>
          <NotePreviewCard note={note} height={noteHeight} />
        </SizeAwareGridItem>
      </div>
    );

    // Use constant note width
    const defaultWidth = 1;

    const layout: Layout = {
      i: key,
      x: (idx * defaultWidth) % cols[currentBreakpoint],
      y: Infinity,
      w: defaultWidth,
      h: !!noteHeight ? heightToGridRows(noteHeight) : 1,
    };

    return [layout, notePreviewCard];
  };

  const layoutsAndNotePreviews = Array.from(
    props.notes.entries(),
    ([i, note]) => {
      return generateLayoutAndNotePreviews(i, note);
    }
  );

  const layouts: ResponsiveLayout = {
    [currentBreakpoint]: layoutsAndNotePreviews.map((x) => x[0]),
  };
  const notePreviews = layoutsAndNotePreviews.map((x) => x[1]);

  /*
  return (
    <ReactGridLayout
      isDraggable={false}
      layout={layouts.xl}
      cols={4}
      width={1440}
      rowHeight={theme.spacing(1)}
    >
      {notePreviews}
    </ReactGridLayout>
  );
  */
  return (
    <ReactGridLayout
      layouts={layouts}
      breakpoints={theme.breakpoints.values}
      cols={cols}
      rowHeight={theme.spacing(1)}
      measureBeforeMount={false}
      onBreakpointChange={setCurrentBreakpoint}
    >
      {notePreviews}
    </ReactGridLayout>
  );

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
