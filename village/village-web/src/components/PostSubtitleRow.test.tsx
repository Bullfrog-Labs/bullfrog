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

describe("follow button is handled correctly", () => {
  const setupMocksAndRenderComponent = (
    isFollowableByViewer: boolean,
    state: {
      isFollowedByViewer: boolean;
    }
  ) => {
    const mockDeletePost = jest.fn();

    const mockSetFollowed = jest.fn(
      async (authorId: UserId, postId: PostId, isFollowed: boolean) => {
        state.isFollowedByViewer = isFollowed;
      }
    );

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
              isFollowedByViewer: state.isFollowedByViewer,
              isFollowableByViewer: isFollowableByViewer,
              setFollowed: mockSetFollowed,
            }}
          />
        </MemoryRouter>
      </AppAuthContext.Provider>
    );

    return {
      screen: screen,
      mockDeletePost: jest.fn(),
      mockSetFollowed: mockSetFollowed,
      isFollowableByViewer: isFollowableByViewer,
      isFollowedByViewer: state.isFollowedByViewer,
    };
  };

  test("unfollowable posts do not display follow button", () => {
    const testSetup = setupMocksAndRenderComponent(false, {
      isFollowedByViewer: false,
    });
    expect(
      testSetup.screen.queryByRole("button", { name: /^Unfollow/ })
    ).not.toBeInTheDocument();
    expect(
      testSetup.screen.queryByRole("button", { name: /^Follow/ })
    ).not.toBeInTheDocument();
  });

  test("Follow works for unfollowed post", async () => {
    const state = { isFollowedByViewer: false };
    const testSetup = setupMocksAndRenderComponent(true, state);
    const { screen, mockSetFollowed } = testSetup;

    const followElement = screen.getByRole("button", {
      name: /^Follow/,
    });
    userEvent.click(followElement);

    await waitFor(() => {
      expect(mockSetFollowed).toBeCalled();
      expect(state.isFollowedByViewer).toBeTruthy();
    });
  });

  test("unfollow works for followed post", async () => {
    const state = { isFollowedByViewer: true };
    const testSetup = setupMocksAndRenderComponent(true, state);
    const { screen, mockSetFollowed } = testSetup;

    const unfollowElement = screen.getByRole("button", {
      name: /^Unfollow/,
    });
    userEvent.click(unfollowElement);

    await waitFor(() => {
      expect(mockSetFollowed).toBeCalled();
      expect(state.isFollowedByViewer).toBeFalsy();
    });
  });
});
