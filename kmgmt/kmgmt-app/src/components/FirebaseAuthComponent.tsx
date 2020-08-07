import React from "react";
import * as log from "loglevel";
import { auth as FirebaseAppAuth, User as FirebaseAppUser } from "firebase/app";
import { StyledFirebaseAuth } from "react-firebaseui";
import firebaseui from "firebaseui";
import FirebaseAuthProvider from "../services/FirebaseAuthProvider";

export default function FirebaseAuthComponent(props: {
  authProvider: FirebaseAuthProvider;
}) {
  let logger = log.getLogger("FirebaseAuthComponent");
  let config: firebaseui.auth.Config = {
    signInOptions: [FirebaseAppAuth.GoogleAuthProvider.PROVIDER_ID],
    signInFlow: "popup",
    callbacks: {
      signInSuccessWithAuthResult: (authResult: FirebaseAppUser) => {
        logger.debug(`Got authResult = ${authResult}`);
        return true;
      },
    },
    signInSuccessUrl: "/",
  };

  let { authProvider } = props;
  return (
    <StyledFirebaseAuth
      uiConfig={config}
      firebaseAuth={authProvider.firebase.auth()}
    />
  );
}
