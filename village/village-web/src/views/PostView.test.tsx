import React from "react";
import { render, waitFor } from "@testing-library/react";
import { BasePostView } from "./PostView";
import { EMPTY_RICH_TEXT } from "../components/richtext/Utils";
import { PostTitle, PostBody } from "../services/store/Posts";

test("Renders BasePostView", async () => {
  let title = "";
  let body = EMPTY_RICH_TEXT;

  const setTitle = jest.fn((newTitle: PostTitle) => {
    title = newTitle;
  });

  const setBody = (newBody: PostBody) => {
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
