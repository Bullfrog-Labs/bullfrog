import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BasePostView, PostRecord } from "./PostView";
import {
  EMPTY_RICH_TEXT_STATE,
  Title,
  Body,
} from "../components/richtext/RichTextEditor";
import { UserRecord } from "../services/store/Users";
import userEvent from "@testing-library/user-event";

test("Renders BasePostView", async () => {
  let postRecord: PostRecord = {
    author: {
      uid: "123",
      displayName: "Foo user",
    },
    title: EMPTY_RICH_TEXT_STATE.title,
    body: EMPTY_RICH_TEXT_STATE.body,
  };

  const setTitle = jest.fn((newTitle: Title) => {
    postRecord.title = newTitle;
  });

  const setBody = (newBody: Body) => {
    postRecord.body = newBody;
  };

  const handleOnIdle = jest.fn();

  const { getByText } = render(
    <BasePostView
      idleTime={25}
      readOnly={false}
      postRecord={postRecord}
      onTitleChange={setTitle}
      onBodyChange={setBody}
      onIdle={handleOnIdle}
    />
  );

  const titleEl = getByText("Enter a title");
  expect(titleEl).toBeInTheDocument();

  await waitFor(() => expect(handleOnIdle).toHaveBeenCalledTimes(1));
});
