import * as log from "loglevel";
import React from "react";
import { render } from "@testing-library/react";
import MainView from "./MainView";
import { Logging } from "kmgmt-common";
import { AuthProvider, AuthContext } from "../services/auth/Auth";
import { MemoryRouter } from "react-router-dom";

Logging.configure(log);

test("renders", () => {
  // this authProvider always authenticates the user automatically
  const authProvider: AuthProvider = {
    onAuthStateChanged: (authState) => {},
    getInitialAuthState: () => ({
      displayName: "Test user",
      email: "testuser@somewhere.com",
    }),
  };

  // Smoke test
  render(
    <AuthContext.Provider value={authProvider.getInitialAuthState()}>
      <MemoryRouter initialEntries={["/"]} initialIndex={0}>
        <MainView />
      </MemoryRouter>
    </AuthContext.Provider>
  );
});
