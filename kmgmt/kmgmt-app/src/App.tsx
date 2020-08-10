import React, { useState, useEffect } from "react";
import AppContainer from "./components/AppContainer";
import Logging from "./services/Logging";
import FirestoreDatabase from "./services/FirestoreDatabase";
import FirebaseAuthProvider from "./services/FirebaseAuthProvider";
import * as log from "loglevel";
import "./App.css";
import { AuthContext } from "./services/Auth";

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

  return (
    <AuthContext.Provider value={authState}>
      <AppContainer database={database} authProvider={authProvider} />
    </AuthContext.Provider>
  );
}

export default App;
