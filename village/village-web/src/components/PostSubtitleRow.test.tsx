import * as log from "loglevel";
import { render } from "@testing-library/react";
import { PostSubtitleRow } from "./PostSubtitleRow";
import { Logging } from "kmgmt-common";
import { u0, p0 } from "../testing/Fixtures";
import { MemoryRouter } from "react-router-dom";
import { DateTime } from "luxon";
import userEvent from "@testing-library/user-event";

Logging.configure(log);

const nopDeletePost = jest.fn();

test("displays basic subtitle info", () => {
  const { getByText } = render(
    <MemoryRouter initialEntries={["/"]} initialIndex={0}>
      <PostSubtitleRow
        viewer={u0}
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
  );

  expect(getByText(u0.displayName)).toBeInTheDocument();
  expect(getByText("May 25")).toBeInTheDocument();
});

test("handle delete post", () => {
  const mockDeletePost = jest.fn();

  const { getByText, getByTitle } = render(
    <MemoryRouter initialEntries={["/"]} initialIndex={0}>
      <PostSubtitleRow
        viewer={u0}
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
  );

  const menuElement = getByTitle("Delete, settings, and more...");
  userEvent.click(menuElement);
  const deleteElement = getByText("Delete");
  userEvent.click(deleteElement);
  expect(mockDeletePost).toHaveBeenCalled();
});
