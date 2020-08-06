import * as log from "loglevel";
import Firebase from "./Firebase";
import { Database } from "./Database";

class FirestoreDatabase {
  logger = log.getLogger("FirestoreDatabase");
  firestore: firebase.firestore.Firestore;
  constructor(firestore: firebase.firestore.Firestore) {
    this.firestore = firestore;
    this.logger.debug("creating FirestoreDatabase");
  }

  static create(): Database {
    const firebase = Firebase.init();
    const firestore = firebase.firestore();
    return new FirestoreDatabase(firestore);
  }

  async getNotes() {
    const coll = await this.firestore.collection("notes").get();
    return coll.docs.map((doc) => {
      const text = doc.data().text;
      return {
        text: text,
      };
    });
  }
}

export default function () {
  return FirestoreDatabase.create();
}
