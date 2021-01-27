import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Logging } from "kmgmt-common";
import * as log from "loglevel";
import { DateTime } from "luxon";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { AuthedTestUserContext } from "../testing/AuthedTestUserContext";
import { p0, u0 } from "../testing/Fixtures";
import { PostSubtitleRow } from "./PostSubtitleRow";

Logging.configure(log);

const nopDeletePost = jest.fn();

test("displays basic subtitle info", () => {
  const { getByText } = render(
    <AuthedTestUserContext user={u0}>
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
    </AuthedTestUserContext>
  );

  expect(getByText(u0.displayName)).toBeInTheDocument();
  expect(getByText("May 25")).toBeInTheDocument();
});

test("handle delete post", () => {
  const mockDeletePost = jest.fn();

  const { getByText, getByTitle } = render(
    <AuthedTestUserContext user={u0}>
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
    </AuthedTestUserContext>
  );

  const menuElement = getByTitle("Delete, settings, and more...");
  userEvent.click(menuElement);
  const deleteElement = getByText("Delete");
  userEvent.click(deleteElement);
  expect(mockDeletePost).toHaveBeenCalled();
});
