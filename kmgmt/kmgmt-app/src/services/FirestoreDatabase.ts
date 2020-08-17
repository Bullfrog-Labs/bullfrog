import * as log from "loglevel";
import Firebase from "./Firebase";
import { Database, UserRecord, NoteRecord } from "./Database";

const USERS_COLLECTION = "users";
const NOTES_COLLECTION = "notes";

export default class FirestoreDatabase implements Database {
  logger = log.getLogger("FirestoreDatabase");
  firestore: firebase.firestore.Firestore;

  constructor(firestore: firebase.firestore.Firestore) {
    this.firestore = firestore;
    this.logger.debug("created FirestoreDatabase");
  }

  static create(): Database {
    const firebase = Firebase.init();
    const firestore = firebase.firestore();
    return new FirestoreDatabase(firestore);
  }

  static of(firestore: firebase.firestore.Firestore): Database {
    return new FirestoreDatabase(firestore);
  }

  async getNotes(userName: string): Promise<NoteRecord[]> {
    // Just using this dummy model for now. Lets replace it completely
    // once we know what we need.
    const userDoc = this.firestore.collection(USERS_COLLECTION).doc(userName);
    const coll = await userDoc.collection(NOTES_COLLECTION).get();
    return coll.docs.map((doc) => {
      return {
        id: doc.id,
        title: doc.data().title,
        body: doc.data().body,
      };
    });
  }

  async getNote(userName: string, id: string): Promise<NoteRecord | null> {
    const noteDoc = await this.firestore
      .collection(USERS_COLLECTION)
      .doc(userName)
      .collection(NOTES_COLLECTION)
      .doc(id)
      .get();
    if (!noteDoc.exists) {
      return null;
    } else {
      return {
        id: noteDoc.id,
        title: noteDoc.data()!.title,
        body: noteDoc.data()!.body,
      };
    }
  }

  async getUser(userName: string): Promise<UserRecord | null> {
    const userDoc = await this.firestore
      .collection(USERS_COLLECTION)
      .doc(userName)
      .get();
    if (!userDoc.exists) {
      return null;
    } else {
      return {
        userName: userDoc.data()!.userName,
      };
    }
  }

  async addUser(userRecord: UserRecord) {
    const doc = this.firestore
      .collection(USERS_COLLECTION)
      .doc(userRecord.userName);
    await doc.set(userRecord);
  }

  async addNote(userName: string, noteRecord: NoteRecord) {
    const userDoc = this.firestore.collection(USERS_COLLECTION).doc(userName);
    const noteDoc = await userDoc.collection(NOTES_COLLECTION).doc();
    noteDoc.set(noteRecord);
  }
}
