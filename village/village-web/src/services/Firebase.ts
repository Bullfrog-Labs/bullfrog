import * as log from "loglevel";

import firebase from "firebase";
import "firebase/analytics";

export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  locationId: process.env.REACT_APP_FIREBASE_LOCATION_ID,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
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
    const AUTH_EMULATOR_ENABLED = false; // see https://github.com/firebase/firebaseui-web-react/pull/125#issuecomment-798798119
    if (AUTH_EMULATOR_ENABLED && !!useEmulator) {
      logger.debug(`using auth emulator at ${DEFAULT_AUTH_EMULATOR_URL}`);
      auth.useEmulator(DEFAULT_AUTH_EMULATOR_URL);
    }
  }

  if (!auth) {
    throw new Error("logic error");
  }

  const functions = firebase.functions();
  if (useEmulator) {
    functions.useEmulator("localhost", 5001);
  }

  return [app, auth, functions];
};
