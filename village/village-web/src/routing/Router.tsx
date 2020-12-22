import React from "react";
import { Switch, Route, BrowserRouter, useLocation } from "react-router-dom";
import { AuthProvider } from "../services/auth/Auth";
import AppContainer from "../components/AppContainer";
import { LoginView } from "../components/auth/LoginView";
import PrivateRoute from "./PrivateRoute";
import MainView from "../components/MainView";
import { ProfileViewController } from "../components/ProfileView";
import { StackViewController } from "../components/StackView";
import { GetUserPostsFn } from "../services/store/Posts";
import { UserRecord } from "../services/store/Users";

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

export const Router = (props: {
  authProvider: AuthProvider;
  getUserPosts: GetUserPostsFn;
  user?: UserRecord;
}) => {
  const { authProvider, getUserPosts, user } = props;
  if (!user) {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/login">
            <AppContainer>
              <LoginView authProvider={authProvider} />
            </AppContainer>
          </Route>
          <Route path="*">
            <Sad404 />
          </Route>
        </Switch>
      </BrowserRouter>
    );
  } else {
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
              <ProfileViewController getUserPosts={getUserPosts} user={user} />
            </AppContainer>
          </PrivateRoute>
          <PrivateRoute exact path="/stack">
            <AppContainer>
              <StackViewController />
            </AppContainer>
          </PrivateRoute>
          <Route path="*">
            <Sad404 />
          </Route>
        </Switch>
      </BrowserRouter>
    );
  }
};
