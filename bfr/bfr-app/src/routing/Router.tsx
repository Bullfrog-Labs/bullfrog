import React, { FunctionComponent } from "react";
import { Switch, Route, BrowserRouter, useLocation } from "react-router-dom";
import { AuthProvider } from "../services/auth/Auth";
import AppContainer from "../components/AppContainer";
import { LoginView } from "../components/auth/LoginView";
import PrivateRoute from "./PrivateRoute";
import MainView from "../components/MainView";
import {
  PocketImportsListView,
  PocketImportItemRecord,
} from "../components/PocketImportsListView";
import { Database } from "../services/store/Database";
import { getItemSet, updateItem } from "../services/store/ItemSets";

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

export type RouterProps = {
  authProvider: AuthProvider;
  database: Database;
};

export const Router: FunctionComponent<RouterProps> = ({
  authProvider,
  database,
}) => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/login">
          <AppContainer>
            <LoginView authProvider={authProvider} />
          </AppContainer>
        </Route>
        <PrivateRoute exact path="/">
          <AppContainer>
            <MainView />
          </AppContainer>
        </PrivateRoute>
        <PrivateRoute exact path="/pocket_imports">
          <AppContainer>
            <PocketImportsListView
              getItemSet={getItemSet(database)}
              updateItem={updateItem(database)}
            />
          </AppContainer>
        </PrivateRoute>
        <Route path="*">
          <Sad404 />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};
