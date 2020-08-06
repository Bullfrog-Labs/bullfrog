import React from "react";
import { render } from "@testing-library/react";
import AppContainer from "./AppContainer";

test("renders learn react link", () => {
  const { getByText } = render(<AppContainer />);
  const linkElement = getByText(/kmgmt-app/i);
  expect(linkElement).toBeInTheDocument();
});
