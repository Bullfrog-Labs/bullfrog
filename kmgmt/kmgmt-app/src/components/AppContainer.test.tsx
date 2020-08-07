import React from "react";
import { render } from "@testing-library/react";
import AppContainer from "./AppContainer";

test("renders AppContainer", () => {
  const database = {
    getNotes: jest.fn(async () => [{ text: "Example note text" }]),
  };
  const { getByText } = render(<AppContainer database={database} />);
  const linkElement = getByText(/kmgmt-app/i);
  expect(linkElement).toBeInTheDocument();
});
