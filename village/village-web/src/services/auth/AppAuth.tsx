import React, { useContext } from "react";
import { UserId, UserRecord } from "../store/Users";
import { AuthProviderState } from "./Auth";

export type AppAuthState = {
  authCompleted: boolean;
  authProviderState?: AuthProviderState;
  authedUser?: UserRecord;
  whitelisted?: boolean;
};

export const AppAuthContext = React.createContext<AppAuthState>({
  authCompleted: false,
  authProviderState: undefined,
  authedUser: undefined,
  whitelisted: undefined,
});

export type AppAuthNotLoggedIn = {
  state: "not-logged-in";
};

export type AppAuthNotWhitelisted = {
  state: "not-whitelisted";
};

export type AppAuthWhitelisted = {
  state: "whitelisted";
  user: UserRecord;
};

export type AppAuthStatus =
  | AppAuthNotLoggedIn
  | AppAuthNotWhitelisted
  | AppAuthWhitelisted;

export const useAppAuthStatusFromAppAuthContext = (): AppAuthStatus => {
  const appAuthState = useContext(AppAuthContext);
  if (!appAuthState.authCompleted || !appAuthState.authProviderState) {
    return { state: "not-logged-in" };
  }

  if (!!appAuthState.whitelisted) {
    return { state: "whitelisted", user: appAuthState.authedUser! };
  } else {
    return { state: "not-whitelisted" };
  }
};

export const useWhitelistedUserFromAppAuthContext = ():
  | UserRecord
  | undefined => {
  const appAuthState = useContext(AppAuthContext);
  return appAuthState.authCompleted &&
    !!appAuthState.whitelisted &&
    !!appAuthState.authedUser
    ? appAuthState.authedUser
    : undefined;
};

export const useIsLoggedIn = (): boolean => {
  const loggedInUser = useWhitelistedUserFromAppAuthContext();
  return !!loggedInUser;
};

export const useIsLoggedInAsUser = (uid: UserId): boolean => {
  const loggedInUser = useWhitelistedUserFromAppAuthContext();
  return !!loggedInUser && loggedInUser.uid === uid;
};

export const useLoggedInUserFromAppAuthContext = (): UserRecord => {
  const user = useWhitelistedUserFromAppAuthContext();
  if (!user) {
    throw new Error("Expected user to be logged in, but they were not");
  }
  return user;
};

export type CurriedByUser<T> = (user: UserRecord) => T;
