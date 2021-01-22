import { render } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext, AuthProvider } from "../services/auth/Auth";
import { Router, RouterProps } from "./Router";

test("renders AppContainer", async () => {
  // this authProvider always authenticates the user automatically
  const authProvider: AuthProvider = {
    onAuthStateChanged: (authState) => {},
    getInitialAuthState: () => ({
      displayName: "Test user",
      uid: "123",
      username: "foo",
    }),
  };

  const routerProps: RouterProps = {
    authProvider: authProvider,
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

  // Smoke test
  const router = (
    <AuthContext.Provider value={authProvider.getInitialAuthState()}>
      <Router {...routerProps} />
    </AuthContext.Provider>
  );
  render(
    <MemoryRouter initialEntries={["/"]} initialIndex={0}>
      {router}
    </MemoryRouter>
  );
});
