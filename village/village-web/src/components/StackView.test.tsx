import * as log from "loglevel";
import { render } from "@testing-library/react";
import { StackView } from "./StackView";
import { Logging } from "kmgmt-common";
import { AuthProvider, AuthContext } from "../services/auth/Auth";
import { PostRecord } from "../services/store/Posts";
import { UserRecord } from "../services/store/Users";
import { u0, p0, posts0, authProvider } from "./ProfileView.test";
import { MemoryRouter } from "react-router-dom";

Logging.configure(log);

test("displays a few posts", () => {
  const { getAllByText } = render(
    <AuthContext.Provider value={authProvider.getInitialAuthState()}>
      <MemoryRouter>
        <StackView posts={userPosts0} source={{ name: p0.title }} />
      </MemoryRouter>
    </AuthContext.Provider>
  );
  expect(getAllByText(u0.username!)[0]).toBeInTheDocument();
  expect(getAllByText(posts0[0].title)[0]).toBeInTheDocument();
  expect(getAllByText(posts0[0].body)[0]).toBeInTheDocument();
});

/**
 * Utils
 */

export const up0 = {
  user: u0,
  post: p0,
};

export const userPosts0 = [up0, up0];
