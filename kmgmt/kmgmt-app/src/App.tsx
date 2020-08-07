import React, { useState, useEffect } from "react";
import AppContainer from "./components/AppContainer";
import Logging from "./services/Logging";
import FirestoreDatabase from "./services/FirestoreDatabase";
import FirebaseAuthProvider from "./services/FirebaseAuthProvider";
import * as log from "loglevel";
import "./App.css";
import FirebaseAuthComponent from "./components/FirebaseAuthComponent";

Logging.configure(log);
const database = FirestoreDatabase.create();
const authProvider = FirebaseAuthProvider.create();

function App() {
  const logger = log.getLogger("App");
  const [authState, setAuthState] = useState(
    authProvider.getInitialAuthState()
  );

  useEffect(() => {
    authProvider.onAuthStateChanged = setAuthState;
  }, []);

  if (authState) {
    logger.debug(`Logged in as ${authState.displayName}`);
  } else {
    logger.debug(`Not logged in`);
  }

  if (authState) {
    return <AppContainer database={database} />;
  } else {
    return <FirebaseAuthComponent authProvider={authProvider} />;
  }
}

export default App;
