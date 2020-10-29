import * as log from "loglevel";

import React, { useState } from "react";
import "./App.css";

import { Logging } from "kmgmt-common";

import { initializeFirebaseApp } from "./services/Firebase";
import FirebaseAuthProvider from "./services/auth/FirebaseAuthProvider";
import { AuthContext } from "./services/auth/Auth";
import Router from "./routing/Router";

Logging.configure(log);
const useEmulators = window.location.hostname === "localhost";
const [app, auth] = initializeFirebaseApp(useEmulators);
const authProvider = FirebaseAuthProvider.create(app, auth);

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
      <Router authProvider={authProvider} />
    </AuthContext.Provider>
  );
}

export default App;
