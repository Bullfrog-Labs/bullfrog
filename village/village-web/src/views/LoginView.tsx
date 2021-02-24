import React from "react";
import { FirebaseAuthComponent } from "../components/auth/FirebaseAuthComponent";
import { AuthProvider } from "../services/auth/Auth";
import FirebaseAuthProvider from "../services/auth/FirebaseAuthProvider";

export type LoginViewProps = {
  authProvider: AuthProvider;
  googleAuthEnabled: boolean;
};

export const LoginView = (props: LoginViewProps) => {
  if (props.authProvider instanceof FirebaseAuthProvider) {
    return (
      <FirebaseAuthComponent
        authProvider={props.authProvider}
        googleAuthEnabled={props.googleAuthEnabled}
      />
    );
  } else {
    throw new Error("Unsupported auth provider");
  }
};
