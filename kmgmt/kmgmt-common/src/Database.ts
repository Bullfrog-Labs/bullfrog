import Slate from "slate";
export type RichText = Slate.Node[];
export type NoteID = string;

export interface NoteRecord {
  id?: NoteID; // should only be null for unsaved new note
  title?: string;
  body: RichText;
}

export interface UserRecord {
  userName: string;
}

export interface Database {
  addUser(userRecord: UserRecord): Promise<void>;
  getUser(userName: string): Promise<UserRecord | null>;

  addNote(userName: string, noteRecord: NoteRecord): Promise<NoteID>;
  updateNote(
    userName: string,
    noteID: NoteID,
    noteRecord: NoteRecord
  ): Promise<void>;

  getNotes(userName: string): Promise<NoteRecord[]>;
  getNote(userName: string, id: NoteID): Promise<NoteRecord | null>;
}
