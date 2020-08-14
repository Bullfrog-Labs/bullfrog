import React from "react";
import { render } from "@testing-library/react";
import RichTextEditor from "./RichTextEditor";

test("renders RichTextEditor", () => {
  const { getByText } = render(<RichTextEditor />);

  const documentTitleElement = getByText("Enter a title");
  const documentBodyElement = getByText("Enter some text");

  expect(documentTitleElement).toBeInTheDocument();
  expect(documentBodyElement).toBeInTheDocument();
});
