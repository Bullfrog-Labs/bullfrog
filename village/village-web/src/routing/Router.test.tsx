import { render } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { AppAuthContext } from "../services/auth/AppAuthContext";
import { AuthProvider } from "../services/auth/Auth";
import { Router, RouterProps } from "./Router";

test("renders AppContainer", async () => {
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

  const routerProps: RouterProps = {
    loginView: <div>Login here</div>,
    getUserPosts: jest.fn(),
    getStackPosts: jest.fn(),
    getUser: jest.fn(),
    getUserByUsername: jest.fn(),
    getPost: jest.fn(),
    createPost: jest.fn(),
    renamePost: jest.fn(),
    syncBody: jest.fn(),
    getGlobalMentions: jest.fn(),
    getSearchSuggestionsByTitlePrefix: jest.fn(),
    getMentionUserPosts: jest.fn(),
    fetchTitleFromOpenGraph: jest.fn(),
  };

  const appAuthState = {
    authCompleted: true,
    authProviderState: authProvider.getInitialAuthProviderState(),
    authedUser: user,
  };

  // Smoke test
  const router = (
    <AppAuthContext.Provider value={appAuthState}>
      <Router {...routerProps} />
    </AppAuthContext.Provider>
  );
  render(
    <MemoryRouter initialEntries={["/"]} initialIndex={0}>
      {router}
    </MemoryRouter>
  );
});
