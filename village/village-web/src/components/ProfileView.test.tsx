import * as log from "loglevel";
import { render } from "@testing-library/react";
import { ProfileView } from "./ProfileView";
import { Logging } from "kmgmt-common";
import { AuthContext } from "../services/auth/Auth";
import { u0, posts0, authProvider } from "../testing/Fixtures";

Logging.configure(log);

test("displays a few posts", () => {
  const { getByText } = render(
    <AuthContext.Provider value={authProvider.getInitialAuthState()}>
      <ProfileView user={u0} posts={posts0} />
    </AuthContext.Provider>
  );
  expect(getByText(u0.displayName)).toBeInTheDocument();
  expect(getByText(u0.description!)).toBeInTheDocument();
  expect(getByText(posts0[0].title)).toBeInTheDocument();
  expect(getByText(posts0[0].body)).toBeInTheDocument();
});
