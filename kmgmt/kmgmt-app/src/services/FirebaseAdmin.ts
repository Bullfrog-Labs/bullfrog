import * as firebase from "firebase-admin";
import * as log from "loglevel";

let app: firebase.app.App | undefined = undefined;
function init() {
  const logger = log.getLogger("FirestoreAdmin");
  if (!app) {
    const config = {
      credential: firebase.credential.applicationDefault(),
      databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    };
    app = firebase.initializeApp(config);
    logger.debug("initialized app");
  }
  return app;
}

export default {
  init,
};
