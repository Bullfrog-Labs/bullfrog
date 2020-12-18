import React from "react";
import { render } from "@testing-library/react";
import { Router } from "./Router";
import { AuthProvider, AuthContext } from "../services/auth/Auth";

import { MemoryRouter } from "react-router-dom";

test("renders AppContainer", async () => {
  // this authProvider always authenticates the user automatically
  const authProvider: AuthProvider = {
    onAuthStateChanged: (authState) => {},
    getInitialAuthState: () => ({ displayName: "Test user", uid: "123" }),
  };

  // Smoke test
  const router = (
    <AuthContext.Provider value={authProvider.getInitialAuthState()}>
      <Router authProvider={authProvider} />
    </AuthContext.Provider>
  );
  render(
    <MemoryRouter initialEntries={["/"]} initialIndex={0}>
      {router}
    </MemoryRouter>
  );
});
