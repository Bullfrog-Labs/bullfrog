import React from "react";
import * as log from "loglevel";
import firebase from "firebase/app";
import { StyledFirebaseAuth } from "react-firebaseui";
import firebaseui from "firebaseui";
import FirebaseAuthProvider from "../../services/auth/FirebaseAuthProvider";
import { useHistory, useLocation, Redirect } from "react-router-dom";
import { AuthContext } from "../../services/auth/Auth";

interface LocationState {
  from: {
    pathname: string;
  };
}

export default function FirebaseAuthComponent(props: {
  authProvider: FirebaseAuthProvider;
}) {
  let logger = log.getLogger("FirebaseAuthComponent");

  let history = useHistory();
  let location = useLocation<LocationState>();

  // Determine where login was from, so we can redirect back there.
  let redirectTo = location.state.from || { pathname: "/" };

  return (
    <AuthContext.Consumer>
      {(authState) => {
        if (authState) {
          // short-circuit because authState has been populated and there is no
          // need to get the user to authenticate manually via the auth component.
          return <Redirect to={redirectTo.pathname} />;
        } else {
          let config: firebaseui.auth.Config = {
            signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
            signInFlow: "popup",
            callbacks: {
              signInSuccessWithAuthResult: (
                authResult: firebase.User,
                redirectUrl
              ) => {
                logger.debug(
                  `successful signin, got authResult = ${authResult}`
                );
                logger.debug(`redirecting to ${redirectTo.pathname}`);

                history.replace(redirectTo);
                return false;
              },
            },
            signInSuccessUrl: redirectTo.pathname,
          };

          return (
            <StyledFirebaseAuth
              uiConfig={config}
              firebaseAuth={props.authProvider.firebase.auth()}
            />
          );
        }
      }}
    </AuthContext.Consumer>
  );
}
