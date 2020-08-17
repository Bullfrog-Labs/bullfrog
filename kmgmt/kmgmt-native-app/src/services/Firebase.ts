import Constants from "expo-constants";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

let app: firebase.app.App | undefined;
function init(): firebase.app.App {
  if (!app) {
    const config = {
      apiKey: Constants.manifest.extra.apiKey,
      authDomain: Constants.manifest.extra.authDomain,
      databaseURL: Constants.manifest.extra.databaseURL,
      projectId: Constants.manifest.extra.projectId,
      storageBucket: Constants.manifest.extra.storageBucket,
      messagingSenderId: Constants.manifest.extra.messagingSenderId,
      appId: Constants.manifest.extra.appId,
    };
    console.log(`Firebase config: ${JSON.stringify(config)}`);
    app = firebase.initializeApp(config);
  }
  return app;
}

export default {
  init,
};
