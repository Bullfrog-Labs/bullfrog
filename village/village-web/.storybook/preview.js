import React from "react";

import { MuiThemeProvider, CssBaseline } from "@material-ui/core";
import theme from "../src/styles/theme";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};

export const decorators = [
  (Story) => {
    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Story />
      </MuiThemeProvider>
    );
  },
];
