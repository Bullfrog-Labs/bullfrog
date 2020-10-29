import * as log from "loglevel";
import React from "react";
import { render, waitFor } from "@testing-library/react";
import MainView from "./MainView";
import { Logging, Database, NoteRecord, UserRecord } from "kmgmt-common";
import { AuthProvider, AuthContext } from "../services/Auth";
import { richTextParagraph } from "./richtext/Utils";

Logging.configure(log);

test("renders single note", async () => {
  const database: Database = {
    getNotes: jest.fn(async () => [
      { id: "example-1", body: richTextParagraph("Example note text") },
    ]),
    addNote: jest.fn(async (userName: string, noteRecord: NoteRecord) => {}),
    getUser: jest.fn(async (userName: string) => ({
      userName: "foo",
    })),
    addUser: jest.fn(async (userRecord: UserRecord) => {}),
  };

  // this authProvider always authenticates the user automatically
  const authProvider: AuthProvider = {
    onAuthStateChanged: (authState) => {},
    getInitialAuthState: () => ({
      displayName: "Test user",
      email: "testuser@somewhere.com",
    }),
  };

  const { getByText } = render(
    <AuthContext.Provider value={authProvider.getInitialAuthState()}>
      <MainView database={database} />
    </AuthContext.Provider>
  );

  /**
   * This waitForElement call is necessary because MainView loads data from an
   * effect hook, which is invoked after the initial render. Even though this
   * happens almost instantaneously because the DB is mocked, we need to wait
   * to get to the next render loop.
   */
  const el = await waitFor(() => {
    return getByText(/Example note text/i);
  });

  expect(el).toBeInTheDocument();
});
