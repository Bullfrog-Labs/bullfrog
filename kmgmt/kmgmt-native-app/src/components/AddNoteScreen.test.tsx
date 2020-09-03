import * as log from "loglevel";
import "react-native-gesture-handler";
import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import { Logging, MockDatabases } from "kmgmt-common";
import AddNoteScreen from "./AddNoteScreen";

Logging.configure(log);
const logger = log.getLogger("AddNoteScreen.test");

test("test with valid user", async () => {
  const mockDB = MockDatabases.singleNote("Example note text");
  logger.debug("running test!");
  const view = <AddNoteScreen database={mockDB} userAuth={{ email: "foo" }} />;
  const { getByText, debug } = render(view);
  debug();
  getByText(/Publish/i);
  debug();
  await waitFor(() => getByText(/Example note text/));
});

test("test adding note", async () => {
  const mockDB = MockDatabases.singleNote("Example note text");
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
