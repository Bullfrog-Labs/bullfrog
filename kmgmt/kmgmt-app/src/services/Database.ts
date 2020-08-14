import { RichText } from "../components/richtext/Types";

export interface NoteRecord {
  title?: string;
  body: RichText;
}

export interface UserRecord {
  userName: string;
}

export interface Database {
  getNotes(userName: string): Promise<NoteRecord[]>;
  addUser(userRecord: UserRecord): Promise<void>;
  addNote(userName: string, noteRecord: NoteRecord): Promise<void>;
}
