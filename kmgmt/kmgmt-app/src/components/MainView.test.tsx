import * as log from "loglevel";
import React from "react";
import { render, waitFor } from "@testing-library/react";
import MainView from "./MainView";
import { Logging, MockDatabases } from "kmgmt-common";
import { AuthProvider, AuthContext } from "../services/Auth";

Logging.configure(log);

test("renders single note", async () => {
  const database = MockDatabases.singleNote();

  // this authProvider always authenticates the user automatically
  const authProvider: AuthProvider = {
    onAuthStateChanged: (authState) => {},
    getInitialAuthState: () => ({
      displayName: "Test user",
      email: "testuser@somewhere.com",
    }),
  };

  const { getByText } = render(
    <AuthContext.Provider value={authProvider.getInitialAuthState()}>
      <MainView database={database} />
    </AuthContext.Provider>
  );

  /**
   * This waitForElement call is necessary because MainView loads data from an
   * effect hook, which is invoked after the initial render. Even though this
   * happens almost instantaneously because the DB is mocked, we need to wait
   * to get to the next render loop.
   */
  const el = await waitFor(() => {
    return getByText(/Example note text/i);
  });

  expect(el).toBeInTheDocument();
});
