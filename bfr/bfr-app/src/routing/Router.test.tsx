import React from "react";
import { render } from "@testing-library/react";
import Router from "./Router";
import { AuthProvider, AuthContext } from "../services/auth/Auth";

test("renders AppContainer", async () => {
  // this authProvider always authenticates the user automatically
  const authProvider: AuthProvider = {
    onAuthStateChanged: (authState) => {},
    getInitialAuthState: () => ({ displayName: "Test user" }),
  };

  // Smoke test
  const router = (
    <AuthContext.Provider value={authProvider.getInitialAuthState()}>
      <Router authProvider={authProvider} />
    </AuthContext.Provider>
  );
  render(router);
});
