import * as log from "loglevel";
import "react-native-gesture-handler";
import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { Logging, NoteRecord, UserRecord, RichTextBuilder } from "kmgmt-common";
import AddNoteScreen from "./AddNoteScreen";

Logging.configure(log);
const logger = log.getLogger("AddNoteScreen.test");

function getMockDB() {
  const body = new RichTextBuilder().addParagraph("Example note text").build();
  return {
    getNotes: jest.fn(async () => [{ id: "example-1", body: body }]),
    getNote: jest.fn(async (id: string) => ({
      id: id,
      body: body,
    })),
    addNote: jest.fn(
      async (userName: string, noteRecord: NoteRecord) => "example-1"
    ),
    getUser: jest.fn(async (userName: string) => ({
      userName: "foo",
    })),
    addUser: jest.fn(async (userRecord: UserRecord) => {}),
    updateNote: jest.fn(
      async (userName: string, noteId: NoteId, noteRecord: NoteRecord) => {}
    ),
  };
}

test("test with valid user", async () => {
  const mockDB = getMockDB();
  logger.debug("running test!");
  const view = <AddNoteScreen database={mockDB} userAuth={{ email: "foo" }} />;
  const { getByText, debug } = render(view);
  debug();
  getByText(/Publish/i);
  await waitFor(() => getByText(/Example note text/));
});
