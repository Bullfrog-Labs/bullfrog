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
  MarkType,
  MarkTypes,
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
  MarkType,
};
export {
  MarkTypes,
  Logging,
  FirestoreDatabase,
  Utils,
  Documents,
  Nodes,
  MockDatabases,
  TypedElement,
  SlateDocument,
};
