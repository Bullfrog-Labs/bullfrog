import React, { useEffect, useState } from "react";
import Router from "./components/Router";
import SignIn from "./components/SignIn";
import Logging from "./services/Logging";
import Firebase from "./services/Firebase";
import { str } from "./utils/Utils";
import FirestoreDatabase from "./services/FirestoreDatabase";
import * as log from "loglevel";
import "./App.css";

Logging.configure(log);
const firebase = Firebase.init();
const database = FirestoreDatabase.create();

function App() {
  const logger = log.getLogger("App");
  const [userAuth, setUserAuth] = useState(firebase.auth().currentUser);

  useEffect(() => {
    firebase.auth().onAuthStateChanged((firebaseUserAuth) => {
      setUserAuth(firebaseUserAuth);
    });
  });

  if (userAuth) {
    logger.info(`Logged in as ${userAuth.displayName}`);
    logger.debug(`User auth ${str(userAuth)}`);
  } else {
    logger.info(`Not logged in`);
  }

  if (userAuth) {
    return <Router database={database} />;
  } else {
    return <SignIn />;
  }
}

export default App;
