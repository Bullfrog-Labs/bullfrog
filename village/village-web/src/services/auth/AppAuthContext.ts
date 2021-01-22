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
