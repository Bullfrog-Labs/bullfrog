import * as log from "loglevel";
import firebase from "firebase";
import { Database } from "./Database";

export class FirestoreDatabase implements Database {
  logger = log.getLogger("FirestoreDatabase");
  firestore: firebase.firestore.Firestore;

  constructor(firestore: firebase.firestore.Firestore, useEmulator?: boolean) {
    this.firestore = firestore;
    this.logger.debug("created FirestoreDatabase");

    const STORE_EMULATOR_HOSTNAME = "localhost";
    const STORE_EMULATOR_PORT = 8080;
    if (!!useEmulator) {
      this.logger.debug(
        `using store emulator at ${STORE_EMULATOR_HOSTNAME}:${STORE_EMULATOR_PORT}`
      );
      firestore.useEmulator(STORE_EMULATOR_HOSTNAME, STORE_EMULATOR_PORT); // only availble in firebase>=8.0.0
    }
  }

  static fromApp(app: firebase.app.App, useEmulator?: boolean): Database {
    const firestore = firebase.firestore(app);
    firestore.settings({ experimentalForceLongPolling: true });
    return new FirestoreDatabase(firestore, useEmulator);
  }

  getHandle(): firebase.firestore.Firestore {
    return this.firestore;
  }
}
