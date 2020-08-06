import React from "react";
import Firebase from "../services/Firebase";
import firebaseui from "firebaseui";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import * as log from "loglevel";
import { auth, User } from "firebase/app";

const firebase = Firebase.init();
const logger = log.getLogger("SignIn");

const config: firebaseui.auth.Config = {
  signInOptions: [auth.GoogleAuthProvider.PROVIDER_ID],
  signInFlow: "popup",
  callbacks: {
    signInSuccessWithAuthResult: (authResult: User) => {
      logger.debug(`Got authResult = ${authResult}`);
      return true;
    },
  },
  signInSuccessUrl: "/",
};

function SignIn() {
  return (
    <StyledFirebaseAuth uiConfig={config} firebaseAuth={firebase.auth()} />
  );
}

export default SignIn;
