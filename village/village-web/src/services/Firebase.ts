import * as log from "loglevel";

import firebase from "firebase";
import "firebase/analytics";

// See https://support.google.com/firebase/answer/7015592 for instructions on
// retrieving this config object.
export const firebaseConfig = {
  apiKey: "AIzaSyBEFkGDQBec7AABTZh9ONrW46AvHY9Od84",
  authDomain: "village-b4647.firebaseapp.com",
  databaseURL: "https://village-b4647.firebaseio.com",
  projectId: "village-b4647",
  storageBucket: "village-b4647.appspot.com",
  messagingSenderId: "379717164586",
  appId: "1:379717164586:web:a70a9c2efa69d1a563ed53",
  measurementId: "G-BD5S72L4C2",
};

let app: firebase.app.App | undefined = undefined;
let auth: firebase.auth.Auth | undefined = undefined;

export const initializeFirebaseApp = (
  useEmulator?: boolean
): [firebase.app.App, firebase.auth.Auth, firebase.functions.Functions] => {
  if (!app) {
    const logger = log.getLogger("Firebase");

    logger.debug("initializing Firebase app");
    app = firebase.initializeApp(firebaseConfig);
    logger.debug("done initializing Firebase app");

    auth = app.auth();
    app.analytics();

    // TODO: Enable Auth emulator once available
    const DEFAULT_AUTH_EMULATOR_URL = "http://localhost:9099/";
    const AUTH_EMULATOR_ENABLED = false; // see https://linear.app/bullfrog/issue/BUL-48#comment-7c0452cf
    if (AUTH_EMULATOR_ENABLED && !!useEmulator) {
      logger.debug(`using auth emulator at ${DEFAULT_AUTH_EMULATOR_URL}`);
      auth.useEmulator(DEFAULT_AUTH_EMULATOR_URL);
    }
  }

  if (!auth) {
    throw new Error("logic error");
  }

  const functions = firebase.functions();

  return [app, auth, functions];
};
