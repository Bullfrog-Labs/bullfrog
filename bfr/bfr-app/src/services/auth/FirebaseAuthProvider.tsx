import * as log from "loglevel";
import firebase from "firebase/app";
import { AuthProvider, OnAuthStateChangedHandle } from "./Auth";

const DEFAULT_EMULATOR_URL = "http://localhost:9099/";

export default class FirebaseAuthProvider implements AuthProvider {
  logger = log.getLogger("FirebaseAuth");
  app: firebase.app.App;
  auth: firebase.auth.Auth;

  onAuthStateChanged: OnAuthStateChangedHandle = (authState) => {
    // no-op by default, needs to be set once the state update function is
    // available.
  };

  constructor(app: firebase.app.App, auth: firebase.auth.Auth) {
    this.app = app;
    this.auth = auth;

    this.auth.onAuthStateChanged((userAuth) => {
      this.onAuthStateChanged(userAuth);
    });

    this.logger.debug("created FirebaseAuth");
  }

  static create(app: firebase.app.App, auth: firebase.auth.Auth) {
    return new FirebaseAuthProvider(app, auth);
  }

  getInitialAuthState() {
    return this.auth.currentUser;
  }
}
