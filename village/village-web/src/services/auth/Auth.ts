import * as log from "loglevel";
import React, { Dispatch, SetStateAction, useState } from "react";
import { UserId } from "../store/Users";

export interface AuthProviderState {
  uid: UserId;
  displayName: string;
  username: string;
}

export type MaybeAuthProviderState = AuthProviderState | null;

export type OnAuthStateChangedHandle = (
  authProviderState: MaybeAuthProviderState
) => void;

export interface AuthProvider {
  onAuthStateChanged: OnAuthStateChangedHandle;
  getInitialAuthProviderState(): MaybeAuthProviderState;
}

export interface AuthState {
  authCompleted: [boolean, Dispatch<SetStateAction<boolean>>];
  authProviderState: [
    MaybeAuthProviderState,
    Dispatch<SetStateAction<MaybeAuthProviderState>>
  ];
}

export const useAuthState = (authProvider: AuthProvider): AuthState => {
  const logger = log.getLogger("Auth");
  const [authCompleted, setAuthCompleted] = useState(false);
  const [authProviderState, setAuthProviderState] = useState(
    authProvider.getInitialAuthProviderState()
  );

  authProvider.onAuthStateChanged = (
    authProviderState: MaybeAuthProviderState
  ) => {
    logger.debug("Auth state changed, updating auth state.");
    setAuthProviderState(authProviderState);

    if (!authProviderState) {
      logger.debug("Empty auth state, not logged in. Done updating auth state");
      setAuthCompleted(true);
      return;
    }

    if (!authProviderState.uid) {
      throw new Error("Authed user uid should not be null");
    }

    logger.debug(
      "Logged in with non-empty auth state. Done updating auth state."
    );
  };

  return {
    authCompleted: [authCompleted, setAuthCompleted],
    authProviderState: [authProviderState, setAuthProviderState],
  };
};

export const AuthContext = React.createContext<MaybeAuthProviderState>(null);
