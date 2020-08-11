import React from "react";
import { render } from "@testing-library/react";
import RichTextEditor from "./RichTextEditor";

test("renders RichTextEditor", () => {
  const { getByPlaceholderText } = render(<RichTextEditor />);

  const documentTitleElement = getByPlaceholderText("Enter a title");
  const documentBodyElement = getByPlaceholderText("Enter some text");

  expect(documentTitleElement).toBeInTheDocument();
  expect(documentBodyElement).toBeInTheDocument();
});
