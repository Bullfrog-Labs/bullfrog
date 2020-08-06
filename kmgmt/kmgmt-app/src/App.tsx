import React, { useEffect, useState } from "react";
import AppContainer from "./components/AppContainer";
import SignIn from "./components/SignIn";
import Logging from "./services/Logging";
import Firebase from "./services/Firebase";
import * as log from "loglevel";
import "./App.css";

Logging.configure(log);
const firebase = Firebase.init();

function App() {
  const logger = log.getLogger("App");
  const [userAuth, setUserAuth] = useState(firebase.auth().currentUser);

  useEffect(() => {
    firebase.auth().onAuthStateChanged((firebaseUserAuth) => {
      setUserAuth(firebaseUserAuth);
    });
  });

  if (userAuth) {
    logger.debug(`Logged in as ${userAuth.displayName}`);
  } else {
    logger.debug(`Not logged in`);
  }

  if (userAuth) {
    return <AppContainer />;
  } else {
    return <SignIn />;
  }
}

export default App;
