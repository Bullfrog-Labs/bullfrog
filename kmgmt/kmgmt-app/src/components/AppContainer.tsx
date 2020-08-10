import React from "react";
import { MuiThemeProvider } from "@material-ui/core";
import { createMuiTheme } from "@material-ui/core/styles";
import MainView from "./MainView";
import { Database } from "../services/Database";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import NoteView from "./NoteView";
import PrivateRoute from "../routing/PrivateRoute";
import { AuthProvider } from "../services/Auth";
import LoginView from "./LoginView";

const theme = createMuiTheme({
  direction: "ltr",
  palette: {
    type: "light",
  },
});

export default function AppContainer(props: {
  database: Database;
  authProvider: AuthProvider;
}) {
  return (
    <MuiThemeProvider theme={theme}>
      <BrowserRouter>
        <Switch>
          <Route path="/login">
            <LoginView authProvider={props.authProvider} />
          </Route>
          <PrivateRoute path="/notes/:id">
            <NoteView database={props.database} />
          </PrivateRoute>
          <PrivateRoute path="/">
            {/* Replace MainView completely with the real component. */}
            <MainView database={props.database} />
          </PrivateRoute>
        </Switch>
      </BrowserRouter>
    </MuiThemeProvider>
  );
}
