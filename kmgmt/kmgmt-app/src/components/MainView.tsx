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

const SizeAwareElement = sizeMe({
  monitorHeight: true,
})((props: { children: React.ReactNode }) => <div>{props.children}</div>);

type ResponsiveLayout = {
  [key: string]: Layout[];
};

function NoteGrid(props: { notes: NoteRecord[] }) {
  // eslint-disable-next-line
  const logger = log.getLogger("NoteGrid");
  const theme = useTheme();

  // Breakpoint tracking and grid columns per breakpoint
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>("xl");
  const cols: { [key in Breakpoint]: number } = {
    xl: 5,
    lg: 4,
    md: 3,
    sm: 1,
    xs: 1,
  };

  // Note size tracking: state and callback
  const [noteSizes, setNoteSizes] = useState<{
    [key: string]: SizeMeProps["size"];
  }>({});

  const onSize = (key: string) => (size: SizeMeProps["size"]) => {
    let newNoteSizes = { ...noteSizes };
    newNoteSizes[key] = size;
    setNoteSizes(newNoteSizes);
  };

  // Determining grid rows from element height
  const heightToGridRows = (x: number) =>
    Math.ceil((x - theme.spacing(1)) / (theme.spacing(1) + 10)) + 1;

  const keyFromNote = (idx: number, note: NoteRecord): string =>
    !!note.id ? note.id : String(idx);

  const notePreviews = Array.from(props.notes.entries(), ([idx, note]) => {
    const key = keyFromNote(idx, note);
    return (
      <div key={key}>
        <SizeAwareElement onSize={onSize(key)}>
          <NotePreviewCard note={note} />
        </SizeAwareElement>
      </div>
    );
  });

  const layouts = {
    [currentBreakpoint]: Array.from(props.notes.entries(), ([idx, note]) => {
      const key = keyFromNote(idx, note);
      // Use constant note width
      const defaultWidth = 1;
      const noteHeight = !!noteSizes[key]
        ? noteSizes[key].height ?? undefined
        : undefined;

      const layout: Layout = {
        i: key,
        x: (idx * defaultWidth) % cols[currentBreakpoint],
        y: Infinity,
        w: defaultWidth,
        h: !!noteHeight ? heightToGridRows(noteHeight) : 1,
      };

      return layout;
    }),
  };

  const validBreakpoints: Set<string> = new Set(theme.breakpoints.keys);

  const onBreakpointChange = (newBreakpoint: string, newCols: number) => {
    if (validBreakpoints.has(newBreakpoint)) {
      setCurrentBreakpoint(newBreakpoint as Breakpoint);
    } else {
      throw Error(`invalid breakpoint ${newBreakpoint}`);
    }
  };

  return (
    <ReactGridLayout
      isDraggable={false}
      isResizable={false}
      layouts={layouts}
      breakpoints={theme.breakpoints.values}
      cols={cols}
      rowHeight={theme.spacing(1)}
      measureBeforeMount={false}
      onBreakpointChange={onBreakpointChange}
    >
      {notePreviews}
    </ReactGridLayout>
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
