import React from "react";
import { render } from "@testing-library/react";
import AppContainer from "./AppContainer";
import { AuthProvider, AuthContext } from "../services/Auth";

test("renders AppContainer", () => {
  const database = {
    getNotes: jest.fn(async () => [{ text: "Example note text" }]),
  };

  // this authProvider always authenticates the user automatically
  const authProvider: AuthProvider = {
    onAuthStateChanged: (authState) => {},
    getInitialAuthState: () => ({ displayName: "Test user" }),
  };

  const { getByText } = render(
    <AuthContext.Provider value={authProvider.getInitialAuthState()}>
      <AppContainer database={database} authProvider={authProvider} />
    </AuthContext.Provider>
  );
  const linkElement = getByText(/kmgmt-app/i);
  expect(linkElement).toBeInTheDocument();
});
