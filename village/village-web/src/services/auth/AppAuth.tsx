import React, { useContext } from "react";
import { UserRecord } from "../store/Users";
import { AuthProviderState } from "./Auth";

export type AppAuthState = {
  authCompleted: boolean;
  authProviderState?: AuthProviderState;
  authedUser?: UserRecord;
};

export const AppAuthContext = React.createContext<AppAuthState>({
  authCompleted: false,
  authProviderState: undefined,
  authedUser: undefined,
});

export const useUserFromAppAuthContext = (): UserRecord | undefined => {
  const appAuthState = useContext(AppAuthContext);
  return appAuthState.authCompleted && !!appAuthState.authedUser
    ? appAuthState.authedUser
    : undefined;
};

export const useIsLoggedIn = (): boolean => {
  const loggedInUser = useUserFromAppAuthContext();
  return !!loggedInUser;
};

export const useLoggedInUserFromAppAuthContext = (): UserRecord => {
  const user = useUserFromAppAuthContext();
  if (!user) {
    throw new Error("Expected user to be logged in, but they were not");
  }
  return user;
};

export type CurriedByUser<T> = (user: UserRecord) => T;
