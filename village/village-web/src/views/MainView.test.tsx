import { render } from "@testing-library/react";
import { Logging } from "kmgmt-common";
import * as log from "loglevel";
import React from "react";
import { AppAuthContext } from "../services/auth/AppAuthContext";
import { AuthProvider } from "../services/auth/Auth";
import MainView from "./MainView";

Logging.configure(log);

test("renders", () => {
  // this authProvider always authenticates the user automatically
  const user = {
    displayName: "Test user",
    uid: "123",
    username: "foo",
  };
  const authProvider: AuthProvider = {
    onAuthStateChanged: (authState) => {},
    getInitialAuthProviderState: () => user,
  };

  const appAuthState = {
    authCompleted: true,
    authProviderState: authProvider.getInitialAuthProviderState(),
    authedUser: user,
  };

  // Smoke test
  render(
    <AppAuthContext.Provider value={appAuthState}>
      <MainView />
    </AppAuthContext.Provider>
  );
});
