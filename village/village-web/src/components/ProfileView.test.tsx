import * as log from "loglevel";
import { render } from "@testing-library/react";
import { ProfileView } from "./ProfileView";
import { Logging } from "kmgmt-common";
import { AuthProvider, AuthContext } from "../services/auth/Auth";
import { PostRecord } from "../services/store/Posts";
import { UserRecord } from "../services/store/Users";

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

/**
 * Utils
 */

export const authProvider: AuthProvider = {
  onAuthStateChanged: (authState) => {},
  getInitialAuthState: () => ({
    displayName: "Test user",
    email: "testuser@somewhere.com",
  }),
};

export const u0: UserRecord = {
  displayName: "Leighland",
  uid: "123",
  description: "Welcome to leighland!",
  username: "l4stewar",
};

export const p0: PostRecord = {
  title: "Title mane",
  body: "Body foo",
  userId: "123",
  updatedAt: new Date(),
  id: "123",
};

export const posts0: PostRecord[] = [p0];
