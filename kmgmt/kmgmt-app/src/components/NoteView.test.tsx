import React from "react";
import { Database, MockDatabases } from "kmgmt-common";
import { NoteView, CreateNewNoteView } from "./NoteView";
import { render, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";
import { AuthProvider, AuthContext } from "../services/Auth";

let mockDatabase: Database;
let mockAuthProvider: AuthProvider;

beforeEach(() => {
  mockDatabase = MockDatabases.singleNote("Example note text");

  mockAuthProvider = {
    onAuthStateChanged: (authState) => {},
    getInitialAuthState: () => ({
      displayName: "Test user",
      email: "testuser@somewhere.com",
    }),
  };
});

test("Renders CreateNewNoteView", () => {
  const { getByText } = render(<CreateNewNoteView database={mockDatabase} />);

  const el = getByText("Enter a title");
  expect(el).toBeInTheDocument();
});

test("Renders NoteView", async () => {
  // this authProvider always authenticates the user automatically
  const authProvider: AuthProvider = {
    onAuthStateChanged: (authState) => {},
    getInitialAuthState: () => ({
      displayName: "Test user",
      email: "testuser@somewhere.com",
    }),
  };

  const history = createMemoryHistory();
  history.push("/notes/example-1");

  const { getByText } = render(
    <AuthContext.Provider value={authProvider.getInitialAuthState()}>
      <Router history={history}>
        <NoteView database={mockDatabase} />
      </Router>
    </AuthContext.Provider>
  );

  const el = await waitFor(() => {
    return getByText(/Example note text/i);
  });

  expect(el).toBeInTheDocument();
});
