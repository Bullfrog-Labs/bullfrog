import React from "react";
import { render } from "@testing-library/react";
import RichTextEditor, {
  EMPTY_RICH_TEXT_STATE,
  Title,
  Body,
} from "./RichTextEditor";
import { RichText } from "./Types";

test("renders RichTextEditor", () => {
  let title = EMPTY_RICH_TEXT_STATE.title;
  const setTitle = (newTitle: Title) => {
    title = newTitle;
  };

  let body = EMPTY_RICH_TEXT_STATE.body;
  const setBody = (newBody: Body) => {
    body = newBody;
  };

  const { getByText } = render(
    <RichTextEditor
      title={title}
      onTitleChange={setTitle}
      body={body}
      onBodyChange={setBody}
    />
  );

  const documentTitleElement = getByText("Enter a title");
  const documentBodyElement = getByText("Enter some text");

  expect(documentTitleElement).toBeInTheDocument();
  expect(documentBodyElement).toBeInTheDocument();
});
