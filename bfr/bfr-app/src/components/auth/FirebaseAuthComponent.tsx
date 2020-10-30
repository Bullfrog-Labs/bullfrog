import React, { FunctionComponent } from "react";
import * as log from "loglevel";
import firebase from "firebase/app";
import { StyledFirebaseAuth } from "react-firebaseui";
import firebaseui from "firebaseui";
import FirebaseAuthProvider from "../../services/auth/FirebaseAuthProvider";
import { useHistory, useLocation, Redirect } from "react-router-dom";
import { AuthContext } from "../../services/auth/Auth";
import { Database } from "../../services/store/Database";

interface LocationState {
  from: {
    pathname: string;
  };
}

export type FirebaseAuthComponentProps = {
  authProvider: FirebaseAuthProvider;
  database: Database;
};

export const FirebaseAuthComponent: FunctionComponent<FirebaseAuthComponentProps> = ({
  authProvider,
  database,
}) => {
  const logger = log.getLogger("FirebaseAuthComponent");

  const history = useHistory();
  const location = useLocation<LocationState>();

  // Determine where the user should be redirected after login. If the user was
  // directed to the login page from a particular URL, they will be redirected
  // back there. If not, they will be redirected back to the default URL.
  const DEFAULT_POST_LOGIN_URL = "/";
  const redirectTo = (location.state && location.state.from) || {
    pathname: DEFAULT_POST_LOGIN_URL,
  };

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
                authResult: firebase.auth.UserCredential,
                redirectUrl
              ) => {
                if (!authResult.user) {
                  throw new Error(
                    "Authed user should not be null after successful signin"
                  );
                }

                logger.debug(
                  `successful signin, got user ${authResult.user.uid} : ${authResult.user.displayName}, ${authResult.user.email}`
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
              firebaseAuth={authProvider.auth}
            />
          );
        }
      }}
    </AuthContext.Consumer>
  );
};
