import * as log from "loglevel";

import firebase from "firebase/app";
import "firebase/auth";

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

const logger = log.getLogger("Firebase");

let app: firebase.app.App | undefined = undefined;
export const initializeFirebaseApp = (
  useEmulator?: boolean
): firebase.app.App => {
  if (!app) {
    logger.debug("initializing Firebase app");
    app = firebase.initializeApp(firebaseConfig);
    logger.debug("done initializing Firebase app");
  }
  return app;
};
