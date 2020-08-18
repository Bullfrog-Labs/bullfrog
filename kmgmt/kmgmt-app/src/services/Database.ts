import { RichText } from "../components/richtext/Types";

export type NoteId = string;

export interface NoteRecord {
  id?: NoteId; // should only be null for unsaved new note
  title?: string;
  body: RichText;
}

export interface UserRecord {
  userName: string;
}

export interface Database {
  addUser(userRecord: UserRecord): Promise<void>;
  getUser(userName: string): Promise<UserRecord | null>;

  addNote(userName: string, noteRecord: NoteRecord): Promise<NoteId>;
  updateNote(
    userName: string,
    noteId: NoteId,
    noteRecord: NoteRecord
  ): Promise<void>;

  getNotes(userName: string): Promise<NoteRecord[]>;
  getNote(userName: string, id: NoteId): Promise<NoteRecord | null>;
}
