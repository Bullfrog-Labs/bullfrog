import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

let app: firebase.app.App | undefined = undefined;
function init() {
  if (!app) {
    const config = {
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
    app = firebase.initializeApp(config);
  }
  return app;
}

export default {
  init,
};
