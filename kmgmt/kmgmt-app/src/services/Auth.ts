import React from "react";

export type AuthState = any;
export type OnAuthStateChangedHandle = (authState: AuthState) => void;

export interface AuthProvider {
  onAuthStateChanged: OnAuthStateChangedHandle;
  getInitialAuthState(): AuthState;
}

export const AuthContext: React.Context<AuthState> = React.createContext(null);
