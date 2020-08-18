import * as log from "loglevel";
import React, { useState } from "react";
import Router from "./components/Router";
import { Logging, FirestoreDatabase } from "kmgmt-common";
import FirebaseAuthProvider from "./services/FirebaseAuthProvider";
import Firebase from "./services/Firebase";
import { AuthContext } from "./services/Auth";
import "./App.css";

Logging.configure(log);
const app = Firebase.init();
const database = FirestoreDatabase.fromApp(app);
const authProvider = FirebaseAuthProvider.create();

function App() {
  const logger = log.getLogger("App");
  const [authState, setAuthState] = useState(
    authProvider.getInitialAuthState()
  );

  authProvider.onAuthStateChanged = setAuthState;

  if (authState) {
    logger.debug(`Logged in as ${authState.displayName} / ${authState.email}`);
  } else {
    logger.info(`Not logged in`);
  }

  return (
    <AuthContext.Provider value={authState}>
      <Router database={database} authProvider={authProvider} />
    </AuthContext.Provider>
  );
}

export default App;
