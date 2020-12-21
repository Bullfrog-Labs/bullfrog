import React, { FunctionComponent } from "react";
import { Switch, Route, BrowserRouter, useLocation } from "react-router-dom";
import { AuthProvider } from "../services/auth/Auth";
import AppContainer from "../components/AppContainer";
import { LoginView } from "../components/auth/LoginView";
import PrivateRoute from "./PrivateRoute";
import MainView from "../components/MainView";
import { ProfileViewController } from "../components/ProfileView";
import StackView from "../components/StackView";

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
};

export const Router: FunctionComponent<RouterProps> = ({ authProvider }) => {
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
        <PrivateRoute exact path="/profile">
          <AppContainer>
            <ProfileViewController />
          </AppContainer>
        </PrivateRoute>
        <PrivateRoute exact path="/stack">
          <AppContainer>
            <StackView />
          </AppContainer>
        </PrivateRoute>
        <Route path="*">
          <Sad404 />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};
