import * as log from "loglevel";
import * as firebase from "firebase/app";
import Firebase from "./Firebase";
import { AuthProvider, OnAuthStateChangedHandle } from "./Auth";

export default class FirebaseAuthProvider implements AuthProvider {
  logger = log.getLogger("FirebaseAuth");
  firebase: firebase.app.App;
  userAuth: firebase.User | null = null;

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

  static create() {
    const firebase = Firebase.init();
    return new FirebaseAuthProvider(firebase);
  }

  getInitialAuthState() {
    return this.firebase.auth().currentUser;
  }
}
