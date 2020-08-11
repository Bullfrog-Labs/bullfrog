import React from "react";
import MainView from "./MainView";
import { Database } from "../services/Database";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import NoteView from "./NoteView";
import AppContainer from "./AppContainer";

export default function Router(props: { database: Database }) {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/notes/:id">
          <AppContainer>
            <NoteView database={props.database} />
          </AppContainer>
        </Route>
        <Route path="/">
          <AppContainer>
            <MainView database={props.database} />
          </AppContainer>
        </Route>
      </Switch>
    </BrowserRouter>
  );
}
