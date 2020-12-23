import React, { FunctionComponent } from "react";
import { AuthProvider } from "../services/auth/Auth";
import { FirebaseAuthComponent } from "../components/auth/FirebaseAuthComponent";
import FirebaseAuthProvider from "../services/auth/FirebaseAuthProvider";

export type LoginViewProps = {
  authProvider: AuthProvider;
};

export const LoginView: FunctionComponent<LoginViewProps> = ({
  authProvider,
}) => {
  if (authProvider instanceof FirebaseAuthProvider) {
    let fbAuthProvider = authProvider as FirebaseAuthProvider;
    return <FirebaseAuthComponent authProvider={fbAuthProvider} />;
  } else {
    // TODO: This should return an error.
    return <div>Unsupported auth provider</div>;
  }
};
