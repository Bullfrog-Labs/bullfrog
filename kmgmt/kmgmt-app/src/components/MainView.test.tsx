import * as log from "loglevel";
import React from "react";
import { render, act, waitForElement } from "@testing-library/react";
import MainView from "./MainView";
import { NoteRecord, UserRecord } from "../services/Database";
import Logging from "../services/Logging";

Logging.configure(log);

test("renders single note", async () => {
  const database = {
    getNotes: jest.fn(async () => [{ body: "Example note text" }]),
    addNote: jest.fn(async (userName: string, noteRecord: NoteRecord) => {}),
    addUser: jest.fn(async (userRecord: UserRecord) => {}),
  };
  const ac = <MainView database={database} />;
  const { getByText } = render(ac);
  const el = await waitForElement(() => {
    return getByText(/Example note text/i);
  });
  expect(el).toBeInTheDocument();
  await database.getNotes();
});
