import React from "react";
import { render, waitForElement } from "@testing-library/react";
import Router from "./Router";
import { AuthProvider, AuthContext } from "../services/Auth";
import { NoteRecord, UserRecord } from "kmgmt-common";

test("renders AppContainer", async () => {
  const database = {
    getNotes: jest.fn(async () => [{ body: "Example note text" }]),
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
