import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { BasePostView } from "./PostView";
import {
  EMPTY_RICH_TEXT_STATE,
  Title,
  Body,
} from "../components/richtext/RichTextEditor";
import { UserRecord } from "../services/store/Users";

test("Renders BasePostView", async () => {
  const author: UserRecord = {
    uid: "123",
    displayName: "Foo user",
  };

  let title = EMPTY_RICH_TEXT_STATE.title;
  const setTitle = (newTitle: Title) => {
    title = newTitle;
  };

  let body = EMPTY_RICH_TEXT_STATE.body;
  const setBody = (newBody: Body) => {
    body = newBody;
  };

  const handleOnIdle = jest.fn();

  const { getByText } = render(
    <BasePostView
      idleTime={25}
      author={author}
      title={title}
      onTitleChange={setTitle}
      body={body}
      onBodyChange={setBody}
      handleOnIdle={handleOnIdle}
    />
  );

  const titleEl = getByText("Enter a title");
  expect(titleEl).toBeInTheDocument();

  await waitFor(() => expect(handleOnIdle).toHaveBeenCalledTimes(1));
});
