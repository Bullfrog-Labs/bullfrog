import React from "react";
import { Database, NoteRecord, UserRecord, NoteId } from "../services/Database";
import { richTextParagraph } from "./richtext/Utils";
import { NoteView, CreateNewNoteView } from "./NoteView";
import { render, waitForElement } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";
import { AuthProvider, AuthContext } from "../services/Auth";

let mockDatabase: Database;
let mockAuthProvider: AuthProvider;

beforeEach(() => {
  mockDatabase = {
    getNotes: jest.fn(async () => [
      { id: "example-1", body: richTextParagraph("Example note text") },
    ]),
    getNote: jest.fn(async (id: string) => ({
      id: id,
      body: richTextParagraph("Example note text"),
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

  const el = await waitForElement(() => {
    return getByText(/Example note text/i);
  });

  expect(el).toBeInTheDocument();
});
