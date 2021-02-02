import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Logging } from "kmgmt-common";
import * as log from "loglevel";
import { DateTime } from "luxon";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { AppAuthContext } from "../services/auth/AppAuth";
import { userToAppAuthState } from "../testing/AppAuthTestUtils";
import { p0, u0 } from "../testing/Fixtures";
import { PostSubtitleRow } from "./PostSubtitleRow";

Logging.configure(log);

const nopDeletePost = jest.fn();

test("displays basic subtitle info", () => {
  const { getByText } = render(
    <AppAuthContext.Provider value={userToAppAuthState(u0)}>
      <MemoryRouter initialEntries={["/"]} initialIndex={0}>
        <PostSubtitleRow
          author={u0}
          postTitle={p0.title}
          postId={p0.id || "123"}
          updatedAt={DateTime.fromObject({
            year: 1982,
            month: 5,
            day: 25,
          }).toJSDate()}
          numMentions={1}
          deletePost={nopDeletePost}
        />
      </MemoryRouter>
    </AppAuthContext.Provider>
  );

  expect(getByText(u0.displayName)).toBeInTheDocument();
  expect(getByText("May 25")).toBeInTheDocument();
});

test("handle delete post", () => {
  const mockDeletePost = jest.fn();

  const { getByText, getByTitle } = render(
    <AppAuthContext.Provider value={userToAppAuthState(u0)}>
      <MemoryRouter initialEntries={["/"]} initialIndex={0}>
        <PostSubtitleRow
          author={u0}
          postTitle={p0.title}
          postId={p0.id || "123"}
          updatedAt={DateTime.fromObject({
            year: 1982,
            month: 5,
            day: 25,
          }).toJSDate()}
          numMentions={1}
          deletePost={mockDeletePost}
        />
      </MemoryRouter>
    </AppAuthContext.Provider>
  );

  const menuElement = getByTitle("Delete, settings, and more...");
  userEvent.click(menuElement);
  const deleteElement = getByText("Delete");
  userEvent.click(deleteElement);
  expect(mockDeletePost).toHaveBeenCalled();
});
