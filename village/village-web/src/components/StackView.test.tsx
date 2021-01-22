import * as log from "loglevel";
import { render } from "@testing-library/react";
import { StackView } from "./StackView";
import { Logging } from "kmgmt-common";
import { u0, p0, posts0, authProvider, userPosts0 } from "../testing/Fixtures";
import { MemoryRouter } from "react-router-dom";
import { richTextStringPreview } from "./richtext/Utils";
import { AppAuthContext } from "../services/auth/AppAuthContext";

Logging.configure(log);

test("displays a few posts", () => {
  const appAuthState = {
    authCompleted: true,
    authProviderState: authProvider.getInitialAuthProviderState(),
  };
  const { getAllByText } = render(
    <AppAuthContext.Provider value={appAuthState}>
      <MemoryRouter>
        <StackView posts={userPosts0} source={{ name: p0.title }} />
      </MemoryRouter>
    </AppAuthContext.Provider>
  );

  const expectedPreview = richTextStringPreview(posts0[0].body)!;
  expect(getAllByText(u0.displayName!)[0]).toBeInTheDocument();
  expect(getAllByText(posts0[0].title)[0]).toBeInTheDocument();
  expect(getAllByText(expectedPreview)[0]).toBeInTheDocument();
});
