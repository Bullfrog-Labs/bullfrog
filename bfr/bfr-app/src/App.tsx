import * as log from "loglevel";

import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";

import { Logging } from "kmgmt-common";

import { initializeFirebaseApp } from "./services/Firebase";
import FirebaseAuthProvider from "./services/auth/FirebaseAuthProvider";
import { AuthContext } from "./services/auth/Auth";
import LoginView from "./components/auth/LoginView";

Logging.configure(log);
const app = initializeFirebaseApp();
const useAuthEmulator = process.env.NODE_ENV !== "production";
const authProvider = FirebaseAuthProvider.create(app, useAuthEmulator);

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
      <LoginView authProvider={authProvider} />
    </AuthContext.Provider>
  );
}

export default App;
