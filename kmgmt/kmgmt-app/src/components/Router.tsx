import React from "react";
import MainView from "./MainView";
import { Database } from "../services/Database";
import { Switch, Route, BrowserRouter, useLocation } from "react-router-dom";
import { CreateNewNoteView, NoteView } from "./NoteView";
import PrivateRoute from "../routing/PrivateRoute";
import { AuthProvider } from "../services/Auth";
import AppContainer from "./AppContainer";
import LoginView from "./LoginView";

function Sad404() {
  let location = useLocation();

  return (
    <div>
      <h3>
        No match for <code>{location.pathname}</code>
      </h3>
    </div>
  );
}

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
        <PrivateRoute path="/create-new-note">
          <AppContainer>
            <CreateNewNoteView database={props.database} />
          </AppContainer>
        </PrivateRoute>
        <PrivateRoute exact path="/">
          <AppContainer>
            <MainView database={props.database} />
          </AppContainer>
        </PrivateRoute>
        <Route path="*">
          <Sad404 />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}
