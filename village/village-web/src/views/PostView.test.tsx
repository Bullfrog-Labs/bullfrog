import React from "react";
import { render, waitFor } from "@testing-library/react";
import { BasePostView } from "./PostView";
import {
  EMPTY_RICH_TEXT_STATE,
  Title,
  Body,
} from "../components/richtext/RichTextEditor";

test("Renders BasePostView", async () => {
  let title = EMPTY_RICH_TEXT_STATE.title;
  let body = EMPTY_RICH_TEXT_STATE.body;

  const setTitle = jest.fn((newTitle: Title) => {
    title = newTitle;
  });

  const setBody = (newBody: Body) => {
    body = newBody;
  };

  const handleOnIdle = jest.fn();

  const { getByText } = render(
    <BasePostView
      idleTime={25}
      readOnly={false}
      title={title}
      body={body}
      onTitleChange={setTitle}
      onBodyChange={setBody}
      onIdle={handleOnIdle}
    />
  );

  const titleEl = getByText("Enter a title");
  expect(titleEl).toBeInTheDocument();

  await waitFor(() => expect(handleOnIdle).toHaveBeenCalledTimes(1));
});
