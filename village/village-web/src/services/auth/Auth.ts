import firebase from "firebase";
import * as log from "loglevel";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { UserId } from "../store/Users";

export interface FederatedAuthProviderData {
  providerType: "federated";
  providerId: string;
  displayName: string | undefined;
  photoURL: string | undefined;
  uid: string;
}

export type DownstreamAuthProviderState = FederatedAuthProviderData;

export interface AuthProviderState {
  uid: UserId;
  displayName: string;
  providerData: DownstreamAuthProviderState[];
}

export type OnAuthStateChangedHandle = (
  authProviderState?: AuthProviderState
) => void;

export interface AuthProvider {
  onAuthStateChanged: OnAuthStateChangedHandle;
  getInitialAuthProviderState(): AuthProviderState | undefined;
}

export interface AuthState {
  authCompleted: [boolean, Dispatch<SetStateAction<boolean>>];
  authProviderState: [
    AuthProviderState | undefined,
    Dispatch<SetStateAction<AuthProviderState | undefined>>
  ];
}

export const useAuthState = (authProvider: AuthProvider): AuthState => {
  const logger = log.getLogger("Auth");
  const [authCompleted, setAuthCompleted] = useState(false);
  const [authProviderState, setAuthProviderState] = useState(
    authProvider.getInitialAuthProviderState()
  );

  authProvider.onAuthStateChanged = useCallback(
    (authProviderState?: AuthProviderState) => {
      logger.debug("Auth state changed, updating auth state.");
      setAuthProviderState(authProviderState);

      if (!authProviderState) {
        logger.debug(
          "Empty auth state, not logged in. Done updating auth state"
        );
        setAuthCompleted(true);
        return;
      }

      if (!authProviderState.uid) {
        throw new Error("Authed user uid should not be null");
      }

      logger.debug(
        "Logged in with non-empty auth state. Done updating auth state."
      );
    },
    [logger]
  );

  return {
    authCompleted: [authCompleted, setAuthCompleted],
    authProviderState: [authProviderState, setAuthProviderState],
  };
};

export const getTwitterUserId = (
  authProviderState: AuthProviderState
): string => {
  const twitterUserId = authProviderState.providerData.find(
    (x) => x.providerId === firebase.auth.TwitterAuthProvider.PROVIDER_ID
  )?.uid;

  if (!twitterUserId) {
    throw new Error(
      `Could not find Twitter user id for auth provider state for user ${authProviderState.uid}`
    );
  }

  return twitterUserId;
};
