import React from "react";
import Container from "@material-ui/core/Container";
import { MuiThemeProvider } from "@material-ui/core";
import { createMuiTheme } from "@material-ui/core/styles";
import MainView from "./MainView";
import { Database } from "../services/Database";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import NoteView from "./NoteView";

const theme = createMuiTheme({
  direction: "ltr",
  palette: {
    type: "light",
  },
});

export default function AppContainer(props: { database: Database }) {
  return (
    <MuiThemeProvider theme={theme}>
      <BrowserRouter>
        <Switch>
          <Route path="/notes/:id">
            <NoteView database={props.database} />
          </Route>
          <Route path="/">
            {/* Replace MainView completely with the real component. */}
            <MainView database={props.database} />
          </Route>
        </Switch>
      </BrowserRouter>
    </MuiThemeProvider>
  );
}
