import React from "react";
import { render, waitForElement } from "@testing-library/react";
import Router from "./Router";
import { AuthProvider, AuthContext } from "../services/Auth";
import { NoteRecord, UserRecord } from "kmgmt-common";
import { richTextParagraph } from "./richtext/Utils";

test("renders AppContainer", async () => {
  const database = {
    getNotes: jest.fn(async () => [
      { id: "example-1", body: richTextParagraph("Example note text") },
    ]),
    getUser: jest.fn(async (userName: string) => {
      return { userName: "foo" };
    }),

    addNote: jest.fn(async (userName: string, noteRecord: NoteRecord) => {}),
    addUser: jest.fn(async (userRecord: UserRecord) => {}),
  };

  // this authProvider always authenticates the user automatically
  const authProvider: AuthProvider = {
    onAuthStateChanged: (authState) => {},
    getInitialAuthState: () => ({ displayName: "Test user" }),
  };

  const { getByText } = render(
    <AuthContext.Provider value={authProvider.getInitialAuthState()}>
      <Router database={database} authProvider={authProvider} />
    </AuthContext.Provider>
  );
  const el = await waitForElement(() => {
    return getByText(/Example note text/i);
  });
  expect(el).toBeInTheDocument();
});
