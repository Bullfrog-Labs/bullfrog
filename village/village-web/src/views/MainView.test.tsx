import { render } from "@testing-library/react";
import { Logging } from "kmgmt-common";
import * as log from "loglevel";
import React from "react";
import { AuthContext, AuthProvider } from "../services/auth/Auth";
import MainView from "./MainView";

Logging.configure(log);

test("renders", () => {
  // this authProvider always authenticates the user automatically
  const authProvider: AuthProvider = {
    onAuthStateChanged: (authState) => {},
    getInitialAuthState: () => ({
      displayName: "Test user",
      uid: "123",
      username: "foo",
    }),
  };

  // Smoke test
  render(
    <AuthContext.Provider value={authProvider.getInitialAuthState()}>
      <MainView />
    </AuthContext.Provider>
  );
});
