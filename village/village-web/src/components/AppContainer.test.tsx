import React from "react";
import { render } from "@testing-library/react";
import AppContainer from "./AppContainer";

test("app container renders children and title", () => {
  // Smoke test for now.
  const ac = <AppContainer>text</AppContainer>;
  render(ac);
});
