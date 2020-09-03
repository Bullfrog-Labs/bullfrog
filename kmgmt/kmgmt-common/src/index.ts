import Logging from "./Logging";
import FirestoreDatabase from "./FirestoreDatabase";
import * as Utils from "./Utils";
import MockDatabases from "./MockDatabases";
import {
  SlateDocument,
  RenderElementFn,
  RenderLeafFn,
} from "./components/SlateDocument";
import {
  Documents,
  Element,
  ElementType,
  DocumentNode,
  TypedElement,
  Nodes,
} from "./Document";
import { Database, NoteRecord, UserRecord, NoteID, RichText } from "./Database";

export type {
  Database,
  NoteRecord,
  UserRecord,
  NoteID,
  Element,
  DocumentNode,
  RichText,
  ElementType,
  RenderElementFn,
  RenderLeafFn,
};
export {
  Logging,
  FirestoreDatabase,
  Utils,
  Documents,
  Nodes,
  MockDatabases,
  TypedElement,
  SlateDocument,
};
