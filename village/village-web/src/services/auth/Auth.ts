import React from "react";
import { UserId } from "../store/Users";

export interface AuthProviderState {
  uid: UserId;
  displayName: string;
  username: string;
}

export type OnAuthStateChangedHandle = (
  authProviderState: AuthProviderState | null
) => void;

export interface AuthProvider {
  onAuthStateChanged: OnAuthStateChangedHandle;
  getInitialAuthState(): AuthProviderState | null;
}

export const AuthContext = React.createContext<AuthProviderState | null>(null);
