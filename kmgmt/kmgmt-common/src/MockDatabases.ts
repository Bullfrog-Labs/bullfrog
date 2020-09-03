import * as log from "loglevel";

import { NoteRecord, UserRecord, NoteID, Database } from "./Database";
import { Documents } from "./Document";

export default class MockDatabases {
  logger = log.getLogger("AddNoteScreen.test");
  static singleNote(text: string = "Example note text"): Database {
    const doc = Documents.paragraph(text);
    const id1 = "example-1";
    return {
      getNotes: jest.fn(async () => [{ id: id1, body: doc.children }]),
      getNote: jest.fn(async (id: string) => ({
        id: id,
        body: doc.children,
      })),
      addNote: jest.fn(
        async (_userName: string, _noteRecord: NoteRecord) => id1
      ),
      getUser: jest.fn(async (_userName: string) => ({
        userName: "foo",
      })),
      addUser: jest.fn(async (_userRecord: UserRecord) => {}),
      updateNote: jest.fn(
        async (
          _userName: string,
          _noteID: NoteID,
          _noteRecord: NoteRecord
        ) => {}
      ),
    };
  }
}
