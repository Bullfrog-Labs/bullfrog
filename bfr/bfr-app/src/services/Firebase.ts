import * as log from "loglevel";

import firebase from "firebase";

// See https://support.google.com/firebase/answer/7015592 for instructions on
// retrieving this config object.
const firebaseConfig = {
  apiKey: "AIzaSyDB96R-eYwLBZWOEcDNyUcgAmLOCtILnaY",
  authDomain: "bullfrog-reader.firebaseapp.com",
  databaseURL: "https://bullfrog-reader.firebaseio.com",
  projectId: "bullfrog-reader",
  storageBucket: "bullfrog-reader.appspot.com",
  messagingSenderId: "447136209695",
  appId: "1:447136209695:web:787b2fcbf3b534a2226e2a",
  measurementId: "G-N4KCV5N686",
};

const DEFAULT_AUTH_EMULATOR_URL = "http://localhost:9099/";

let app: firebase.app.App | undefined = undefined;
let auth: firebase.auth.Auth | undefined = undefined;

export const initializeFirebaseApp = (
  useEmulator?: boolean
): [firebase.app.App, firebase.auth.Auth] => {
  if (!app) {
    const logger = log.getLogger("Firebase");

    logger.debug("initializing Firebase app");
    app = firebase.initializeApp(firebaseConfig);
    logger.debug("done initializing Firebase app");

    auth = app.auth();

    const AUTH_EMULATOR_ENABLED = false; // see https://linear.app/bullfrog/issue/BUL-48#comment-7c0452cf
    if (AUTH_EMULATOR_ENABLED && !!useEmulator) {
      logger.debug(`using auth emulator at ${DEFAULT_AUTH_EMULATOR_URL}`);
      auth.useEmulator(DEFAULT_AUTH_EMULATOR_URL);
    }
  }

  if (!auth) {
    throw new Error("logic error");
  }

  return [app, auth];
};
