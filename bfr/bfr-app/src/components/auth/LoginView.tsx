import React, { FunctionComponent } from "react";
import { AuthProvider } from "../../services/auth/Auth";
import { FirebaseAuthComponent } from "./FirebaseAuthComponent";
import FirebaseAuthProvider from "../../services/auth/FirebaseAuthProvider";
import { Database } from "../../services/store/Database";

export type LoginViewProps = {
  authProvider: AuthProvider;
  database: Database;
};

export const LoginView: FunctionComponent<LoginViewProps> = ({
  authProvider,
  database,
}) => {
  if (authProvider instanceof FirebaseAuthProvider) {
    let fbAuthProvider = authProvider as FirebaseAuthProvider;
    return (
      <FirebaseAuthComponent
        authProvider={fbAuthProvider}
        database={database}
      />
    );
  } else {
    // TODO: This should return an error.
    return <div>Unsupported auth provider</div>;
  }
};
