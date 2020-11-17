import React, { FunctionComponent } from "react";
import { Switch, Route, BrowserRouter, useLocation } from "react-router-dom";
import { AuthProvider } from "../services/auth/Auth";
import AppContainer from "../components/AppContainer";
import { LoginView } from "../components/auth/LoginView";
import PrivateRoute from "./PrivateRoute";
import MainView from "../components/MainView";
import { PocketImportsListView } from "../components/PocketImportsListView";
import { Database } from "../services/store/Database";
import { getItemSet, ItemStatus, updateItem } from "../services/store/ItemSets";

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

export type InboxViewProps = {
  database: Database;
};

const InboxView: FunctionComponent<InboxViewProps> = ({ database }) => {
  return (
    <PocketImportsListView
      getItemSet={getItemSet(database)}
      updateItem={updateItem(database)}
      title="Inbox"
      statusFilter={[ItemStatus.Unread]}
      showSnoozed={false}
    />
  );
};

export type LibraryViewProps = {
  database: Database;
};

const LibraryView: FunctionComponent<LibraryViewProps> = ({ database }) => {
  return (
    <PocketImportsListView
      getItemSet={getItemSet(database)}
      updateItem={updateItem(database)}
      title="Library"
      statusFilter={[ItemStatus.Unread, ItemStatus.Archived]}
      showSnoozed={true}
    />
  );
};

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
            <InboxView database={database} />
          </AppContainer>
        </PrivateRoute>
        <PrivateRoute exact path="/library">
          <AppContainer>
            <LibraryView database={database} />
          </AppContainer>
        </PrivateRoute>
        <Route path="*">
          <Sad404 />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};
