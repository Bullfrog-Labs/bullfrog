import { render } from "@testing-library/react";
import { Logging } from "kmgmt-common";
import * as log from "loglevel";
import { MemoryRouter } from "react-router-dom";
import { AppAuthContext } from "../services/auth/AppAuth";
import { authProvider, posts0, u0 } from "../testing/Fixtures";
import { ProfileView } from "./ProfileView";
import { richTextStringPreview } from "./richtext/Utils";

Logging.configure(log);

test("displays a few posts", () => {
  const appAuthState = {
    authCompleted: true,
    authProviderState: authProvider.getInitialAuthProviderState(),
  };

  const { getByText } = render(
    <AppAuthContext.Provider value={appAuthState}>
      <MemoryRouter initialEntries={["/"]} initialIndex={0}>
        <ProfileView user={u0} posts={posts0} />
      </MemoryRouter>
    </AppAuthContext.Provider>
  );

  const expectedPreview = richTextStringPreview(posts0[0].body)!;
  expect(getByText(u0.displayName)).toBeInTheDocument();
  expect(getByText(u0.description!)).toBeInTheDocument();
  expect(getByText(posts0[0].title)).toBeInTheDocument();
  expect(getByText(expectedPreview)).toBeInTheDocument();
});
