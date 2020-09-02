import * as log from "loglevel";
import "react-native-gesture-handler";
import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import {
  Logging,
  NoteRecord,
  UserRecord,
  Documents,
  NoteID,
  Database,
} from "kmgmt-common";
import AddNoteScreen from "./AddNoteScreen";

Logging.configure(log);
const logger = log.getLogger("AddNoteScreen.test");

function getMockDB() {
  const doc = Documents.paragraph("Example note text");
  const db: Database = {
    getNotes: jest.fn(async () => [{ id: "example-1", body: doc.children }]),
    getNote: jest.fn(async (id: string) => ({
      id: id,
      body: doc.children,
    })),
    addNote: jest.fn(
      async (_userName: string, _noteRecord: NoteRecord) => "example-1"
    ),
    getUser: jest.fn(async (_userName: string) => ({
      userName: "foo",
    })),
    addUser: jest.fn(async (_userRecord: UserRecord) => {}),
    updateNote: jest.fn(
      async (_userName: string, _noteID: NoteID, _noteRecord: NoteRecord) => {}
    ),
  };
  return db;
}

test("test with valid user", async () => {
  const mockDB = getMockDB();
  logger.debug("running test!");
  const view = <AddNoteScreen database={mockDB} userAuth={{ email: "foo" }} />;
  const { getByText, debug } = render(view);
  debug();
  getByText(/Publish/i);
  debug();
  await waitFor(() => getByText(/Example note text/));
});

test("test adding note", async () => {
  const mockDB = getMockDB();
  logger.debug("running test!");
  const view = <AddNoteScreen database={mockDB} userAuth={{ email: "foo" }} />;
  const { getByText, debug, getByA11yLabel } = render(view);
  debug();
  await waitFor(() => getByText(/Example note text/));
  const input = getByA11yLabel("Note Input");
  fireEvent.changeText(input, "New note text");
  const button = getByText(/Publish/i);
  fireEvent.press(button);
  debug();
  await waitFor(() => getByText(/New note text/));
});
