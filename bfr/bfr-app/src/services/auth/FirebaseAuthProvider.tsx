import * as log from "loglevel";
import firebase from "firebase/app";
import { AuthProvider, OnAuthStateChangedHandle } from "./Auth";

export default class FirebaseAuthProvider implements AuthProvider {
  logger = log.getLogger("FirebaseAuth");
  firebase: firebase.app.App;

  onAuthStateChanged: OnAuthStateChangedHandle = (authState) => {
    // no-op by default, needs to be set once the state update function is
    // available.
  };

  constructor(firebase: firebase.app.App) {
    this.firebase = firebase;
    this.firebase.auth().onAuthStateChanged((userAuth) => {
      this.onAuthStateChanged(userAuth);
    });

    this.logger.debug("created FirebaseAuth");
  }

  static create(firebase: firebase.app.App) {
    return new FirebaseAuthProvider(firebase);
  }

  getInitialAuthState() {
    return this.firebase.auth().currentUser;
  }
}
