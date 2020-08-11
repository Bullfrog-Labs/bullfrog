import React from "react";
import { render } from "@testing-library/react";
import AppContainer from "./AppContainer";

test("renders learn react link", () => {
  const ac = <AppContainer>text</AppContainer>;
  const { getByText } = render(ac);
  const typo = getByText(/kmgmt/i);
  expect(typo).toBeInTheDocument();
});
