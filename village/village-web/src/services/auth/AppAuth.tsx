import React from "react";
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

// App.tsx only renders components after auth has been completed, so
// AppAuthedComponent never has to worry about the case where auth has not been
// completed. Once auth has been completed, there are only two states: the user
// was authenticated and we have their user record, or they were not
// authenticated and so there is no user record.
export type AppAuthedComponentProps = {
  withUser: (user?: UserRecord) => React.ReactChild;
};

export const AppAuthedComponent = (props: AppAuthedComponentProps) => {
  const appAuthStateToChild = (appAuthState: AppAuthState) => {
    return appAuthState.authCompleted && !!appAuthState.authedUser
      ? props.withUser(appAuthState.authedUser)
      : props.withUser();
  };

  return (
    <AppAuthContext.Consumer>{appAuthStateToChild}</AppAuthContext.Consumer>
  );
};

export type CurriedByUser<T> = (user: UserRecord) => T;
