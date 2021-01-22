import firebase from "firebase/app";
import * as log from "loglevel";
import {
  AuthProvider,
  AuthProviderState,
  OnAuthStateChangedHandle,
} from "./Auth";

export const userToAuthProviderState = (
  apUser: firebase.User
): AuthProviderState => ({
  uid: apUser.uid,
  displayName: apUser.displayName ?? "",
  username: apUser.providerData[0]?.displayName ?? "",
});

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
      this.onAuthStateChanged(
        userAuth ? userToAuthProviderState(userAuth) : null
      );
    });

    this.logger.debug("created FirebaseAuth");
  }

  static create(app: firebase.app.App, auth: firebase.auth.Auth) {
    return new FirebaseAuthProvider(app, auth);
  }

  getInitialAuthState() {
    const apUser = this.auth.currentUser;
    return !!apUser ? userToAuthProviderState(apUser) : null;
  }
}
