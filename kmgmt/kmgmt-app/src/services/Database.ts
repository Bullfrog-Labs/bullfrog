export interface NoteRecord {
  text: string;
}

export interface Database {
  getNotes(): Promise<NoteRecord[]>;
}
