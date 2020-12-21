import firebase from "firebase";

// union type for underlying handle to all supported databases
type DatabaseHandle = firebase.firestore.Firestore;

export interface Database {
  getHandle(): DatabaseHandle;
}
