import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

import { MemoryRouter } from "react-router-dom";

test("renders app landing page", () => {
  // render smoke test
  render(
    <MemoryRouter initialEntries={["/"]} initialIndex={0}>
      <App />
    </MemoryRouter>
  );
});
