import firebase from "firebase/app";
import * as log from "loglevel";
import {
  AuthProvider,
  AuthProviderState,
  DownstreamAuthProviderState,
  FederatedAuthProviderData,
  OnAuthStateChangedHandle,
} from "./Auth";

const firebaseProviderDataToFederatedProviderData = (
  providerData: firebase.UserInfo
): FederatedAuthProviderData => {
  return {
    providerType: "federated",
    providerId: providerData.providerId,
    displayName: providerData.displayName ?? undefined,
    photoURL: providerData.photoURL ?? undefined,
    uid: providerData.uid,
  };
};

export const userToAuthProviderState = (
  apUser: firebase.User
): AuthProviderState => {
  console.log(apUser);
  console.log(apUser.providerData);

  const providerData: DownstreamAuthProviderState[] = apUser.providerData
    .filter((x) => !!x)
    .map((x) => firebaseProviderDataToFederatedProviderData(x!));

  return {
    uid: apUser.uid,
    displayName: apUser.displayName ?? "",
    providerData,
  };
};

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
        userAuth ? userToAuthProviderState(userAuth) : undefined
      );
    });

    this.logger.debug("created FirebaseAuth");
  }

  static create(app: firebase.app.App, auth: firebase.auth.Auth) {
    return new FirebaseAuthProvider(app, auth);
  }

  getInitialAuthProviderState() {
    const apUser = this.auth.currentUser;
    return !!apUser ? userToAuthProviderState(apUser) : undefined;
  }
}
