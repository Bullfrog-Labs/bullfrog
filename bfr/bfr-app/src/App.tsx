import * as log from "loglevel";

import React, { useState } from "react";
import "./App.css";

import { Logging } from "kmgmt-common";

import { initializeFirebaseApp } from "./services/Firebase";
import FirebaseAuthProvider from "./services/auth/FirebaseAuthProvider";
import { AuthContext, OnAuthStateChangedHandle } from "./services/auth/Auth";
import { Router } from "./routing/Router";
import { FirestoreDatabase } from "./services/store/FirestoreDatabase";
import { checkIfUserExists } from "./services/store/Users";

Logging.configure(log);
const useEmulators = window.location.hostname === "localhost";
const [app, auth] = initializeFirebaseApp(useEmulators);
const authProvider = FirebaseAuthProvider.create(app, auth);
const database = FirestoreDatabase.fromApp(app);

function App() {
  const logger = log.getLogger("App");
  const [authState, setAuthState] = useState(
    authProvider.getInitialAuthState()
  );

  const onAuthStateChanged: OnAuthStateChangedHandle = async (
    authedUser: firebase.User
  ) => {
    logger.debug("Auth state changed, updating auth state.");
    setAuthState(authedUser);

    if (!authedUser) {
      logger.debug("Empty auth state, not logged in. Done updating auth state");
      return;
    }

    if (!authedUser.email) {
      throw new Error("Authed user email should not be null");
    }

    // TODO: do user state setup stuff here
    const userExists = await checkIfUserExists(database, authedUser.email);
    logger.debug(`userExists: ${userExists}`);

    logger.debug("User logged in. Done updating auth state.");
  };

  authProvider.onAuthStateChanged = onAuthStateChanged;

  if (authState) {
    logger.debug(`Logged in as ${authState.displayName} / ${authState.email}`);
  } else {
    logger.info(`Not logged in`);
  }

  return (
    <AuthContext.Provider value={authState}>
      <Router authProvider={authProvider} database={database} />
    </AuthContext.Provider>
  );
}

export default App;
