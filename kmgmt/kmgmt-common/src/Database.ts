// Taken from Slate type definitions
export interface Text {
  text: string;
}

export interface Element {
  children: Node[];
  type: string;
}

export declare type Node = Element | Text;

export type RichText = Node[];

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
