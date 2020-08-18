import React from "react";
import MainView from "./MainView";
import { Database } from "kmgmt-common";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import NoteView from "./NoteView";
import PrivateRoute from "../routing/PrivateRoute";
import { AuthProvider } from "../services/Auth";
import AppContainer from "./AppContainer";
import LoginView from "./LoginView";

export default function Router(props: {
  database: Database;
  authProvider: AuthProvider;
}) {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/login">
          <AppContainer>
            <LoginView authProvider={props.authProvider} />
          </AppContainer>
        </Route>
        <PrivateRoute path="/notes/:id">
          <AppContainer>
            <NoteView database={props.database} />
          </AppContainer>
        </PrivateRoute>
        <PrivateRoute path="/">
          <AppContainer>
            <MainView database={props.database} />
          </AppContainer>
        </PrivateRoute>
      </Switch>
    </BrowserRouter>
  );
}
