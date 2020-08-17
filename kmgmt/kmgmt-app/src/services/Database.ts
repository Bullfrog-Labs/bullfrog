import { RichText } from "../components/richtext/Types";
export interface NoteRecord {
  id?: string; // should only be null for unsaved new note
  title?: string;
  body: RichText;
}

export interface UserRecord {
  userName: string;
}

export interface Database {
  addUser(userRecord: UserRecord): Promise<void>;
  getUser(userName: string): Promise<UserRecord | null>;

  addNote(userName: string, noteRecord: NoteRecord): Promise<void>;
  getNotes(userName: string): Promise<NoteRecord[]>;
  getNote(userName: string, id: string): Promise<NoteRecord | null>;
}
