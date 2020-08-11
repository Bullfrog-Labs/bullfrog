import React from "react";
import { AuthProvider } from "../services/Auth";
import FirebaseAuthComponent from "./FirebaseAuthComponent";
import FirebaseAuthProvider from "../services/FirebaseAuthProvider";

export default function LoginView(props: { authProvider: AuthProvider }) {
  if (props.authProvider instanceof FirebaseAuthProvider) {
    let fbAuthProvider = props.authProvider as FirebaseAuthProvider;
    return <FirebaseAuthComponent authProvider={fbAuthProvider} />;
  } else {
    return <div>Unsupported auth provider</div>;
  }
}
