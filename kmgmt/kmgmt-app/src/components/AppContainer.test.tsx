import React from "react";
import { render } from "@testing-library/react";
import AppContainer from "./AppContainer";

test("app container renders children and title", () => {
  const ac = <AppContainer>text</AppContainer>;
  const { getByText } = render(ac);
  const title = getByText(/kmgmt/i);
  expect(title).toBeInTheDocument();
  const child = getByText(/text/i);
  expect(child).toBeInTheDocument();
});
