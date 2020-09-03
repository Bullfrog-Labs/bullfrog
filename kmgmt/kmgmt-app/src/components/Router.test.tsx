import React from "react";
import { render, waitFor } from "@testing-library/react";
import Router from "./Router";
import { AuthProvider, AuthContext } from "../services/Auth";
import { MockDatabases } from "kmgmt-common";

test("renders AppContainer", async () => {
  const database = MockDatabases.singleNote("Example note text");

  // this authProvider always authenticates the user automatically
  const authProvider: AuthProvider = {
    onAuthStateChanged: (_authState) => {},
    getInitialAuthState: () => ({ displayName: "Test user" }),
  };

  const { getByText } = render(
    <AuthContext.Provider value={authProvider.getInitialAuthState()}>
      <Router database={database} authProvider={authProvider} />
    </AuthContext.Provider>
  );
  const el = await waitFor(() => {
    return getByText(/Example note text/i);
  });
  expect(el).toBeInTheDocument();
});
