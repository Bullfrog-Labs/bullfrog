import * as log from "loglevel";
import Firebase from "./Firebase";
import { Database } from "./Database";

export default class FirestoreDatabase {
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

  async getNotes() {
    // Just using this dummy model for now. Lets replace it completely
    // once we know what we need.
    const coll = await this.firestore.collection("dummy_notes").get();
    return coll.docs.map((doc) => {
      const text = doc.data().text;
      return {
        text: text,
      };
    });
  }
}
