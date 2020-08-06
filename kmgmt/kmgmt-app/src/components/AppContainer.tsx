import React from "react";
import Container from "@material-ui/core/Container";
import { MuiThemeProvider } from "@material-ui/core";
import { createMuiTheme } from "@material-ui/core/styles";
import MainView from "./MainView";
import { Database } from "../services/Database";

const theme = createMuiTheme({
  direction: "ltr",
  palette: {
    type: "light",
  },
});

export default function AppContainer(props: { database: Database }) {
  return (
    <MuiThemeProvider theme={theme}>
      <Container maxWidth="md">
        {/* Replace MainView completely with the real component. */}
        <MainView database={props.database} />
      </Container>
    </MuiThemeProvider>
  );
}
