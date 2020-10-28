import * as log from "loglevel";

import React, { useState } from "react";
import "./App.css";

import { Logging } from "kmgmt-common";

import { initializeFirebaseApp } from "./services/Firebase";
import FirebaseAuthProvider from "./services/auth/FirebaseAuthProvider";
import { AuthContext } from "./services/auth/Auth";
import LoginView from "./components/auth/LoginView";
import { BrowserRouter } from "react-router-dom";

Logging.configure(log);
const useEmulators = process.env.NODE_ENV !== "production";
const app = initializeFirebaseApp(useEmulators);
const authProvider = FirebaseAuthProvider.create(app, useEmulators);

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
    <BrowserRouter>
      <AuthContext.Provider value={authState}>
        <LoginView authProvider={authProvider} />
      </AuthContext.Provider>
    </BrowserRouter>
  );
}

export default App;
