import React from "react";
import { render } from "@testing-library/react";
import RichTextEditor, { Body } from "./RichTextEditor";
import { EMPTY_RICH_TEXT } from "./Utils";

// TODO: Figure out how to test RichTextEditor more deeply. It might be that
// js-dom is insufficient to test it, i.e. an actual browser is needed.

test("renders RichTextEditor", () => {
  let body = EMPTY_RICH_TEXT;
  const setBody = (newBody: Body) => {
    body = newBody;
  };

  const { getByText } = render(
    <RichTextEditor body={body} onChange={setBody} />
  );

  const documentBodyElement = getByText("Enter some text");
  expect(documentBodyElement).toBeInTheDocument();
});
