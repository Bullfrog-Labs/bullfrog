import * as log from "loglevel";
import firebase from "firebase/app";
import { AuthProvider, OnAuthStateChangedHandle } from "./Auth";

const DEFAULT_EMULATOR_URL = "http://localhost:9099/";

export default class FirebaseAuthProvider implements AuthProvider {
  logger = log.getLogger("FirebaseAuth");
  firebase: firebase.app.App;

  onAuthStateChanged: OnAuthStateChangedHandle = (authState) => {
    // no-op by default, needs to be set once the state update function is
    // available.
  };

  constructor(firebase: firebase.app.App, useEmulator?: boolean) {
    this.firebase = firebase;

    if (!!useEmulator) {
      this.firebase.auth().useEmulator(DEFAULT_EMULATOR_URL);
    }

    this.firebase.auth().onAuthStateChanged((userAuth) => {
      this.onAuthStateChanged(userAuth);
    });

    this.logger.debug("created FirebaseAuth");
  }

  static create(firebase: firebase.app.App, useEmulator?: boolean) {
    return new FirebaseAuthProvider(firebase, useEmulator);
  }

  getInitialAuthState() {
    return this.firebase.auth().currentUser;
  }
}
