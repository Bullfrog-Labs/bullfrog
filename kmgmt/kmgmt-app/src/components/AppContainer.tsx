import React from "react";
import Container from "@material-ui/core/Container";
import { MuiThemeProvider } from "@material-ui/core";
import { createMuiTheme } from "@material-ui/core/styles";
import MainView from "./MainView";

const theme = createMuiTheme({
  direction: "ltr",
  palette: {
    type: "light",
  },
});

export default function AppContainer() {
  return (
    <MuiThemeProvider theme={theme}>
      <Container maxWidth="lg">
        {/* Replace MainView completely with the real component. */}
        <MainView />
      </Container>
    </MuiThemeProvider>
  );
}
