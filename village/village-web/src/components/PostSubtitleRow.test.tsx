import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Logging } from "kmgmt-common";
import * as log from "loglevel";
import { DateTime } from "luxon";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { AppAuthContext } from "../services/auth/AppAuth";
import { PostId } from "../services/store/Posts";
import { UserId } from "../services/store/Users";
import { userToAppAuthState } from "../testing/AppAuthTestUtils";
import { p0, u0, u1 } from "../testing/Fixtures";
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
          followablePostViewState={{
            followCount: 0,
            isFollowedByViewer: false,
            isFollowableByViewer: false,
          }}
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
          followablePostViewState={{
            followCount: 0,
            isFollowedByViewer: false,
            isFollowableByViewer: false,
          }}
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

test("handle follow post", async () => {
  const mockDeletePost = jest.fn();

  const renderComponent = (
    isFollowedByViewer: boolean,
    isFollowableByViewer: boolean
  ) => {
    const screen = render(
      <AppAuthContext.Provider value={userToAppAuthState(u0)}>
        <MemoryRouter initialEntries={["/"]} initialIndex={0}>
          <PostSubtitleRow
            author={u1}
            postTitle={p0.title}
            postId={p0.id || "123"}
            updatedAt={DateTime.fromObject({
              year: 1982,
              month: 5,
              day: 25,
            }).toJSDate()}
            numMentions={1}
            deletePost={mockDeletePost}
            followablePostViewState={{
              followCount: 0,
              isFollowedByViewer: isFollowedByViewer,
              isFollowableByViewer: isFollowableByViewer,
              setFollowed: mockSetFollowed,
            }}
          />
        </MemoryRouter>
      </AppAuthContext.Provider>
    );
    return screen;
  };

  let isFollowedByViewer = false;
  const mockSetFollowed = jest.fn(
    async (authorId: UserId, postId: PostId, isFollowed: boolean) => {
      isFollowedByViewer = isFollowed;
    }
  );

  const screenNotFollowed = renderComponent(isFollowedByViewer, true);

  const followElement = screenNotFollowed.getByRole("button", {
    name: /^Follow/,
  });
  userEvent.click(followElement);

  await waitFor(() => {
    expect(mockSetFollowed).toBeCalled();
    expect(isFollowedByViewer).toBeTruthy();
  });

  const screenFollowed = renderComponent(isFollowedByViewer, true);

  const unfollowElement = screenFollowed.getByRole("button", {
    name: /^Unfollow/,
  });
  userEvent.click(unfollowElement);

  await waitFor(() => {
    expect(mockSetFollowed).toBeCalled();
    expect(isFollowedByViewer).toBeFalsy();
  });

  const screenUnfollowable = renderComponent(false, false);
  expect(
    screenUnfollowable.queryByRole("button", { name: /^Unfollow/ })
  ).not.toBeInTheDocument();
  expect(
    screenUnfollowable.queryByRole("button", { name: /^Follow/ })
  ).not.toBeInTheDocument();
});
