export interface NoteRecord {
  title?: string;
  body: string;
}

export interface UserRecord {
  userName: string;
}

export interface Database {
  getNotes(userName: string): Promise<NoteRecord[]>;
  addUser(userRecord: UserRecord): Promise<void>;
  addNote(userName: string, noteRecord: NoteRecord): Promise<void>;
}
