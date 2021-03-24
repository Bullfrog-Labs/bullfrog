import { Button, Grid } from "@material-ui/core";
import firebase from "firebase/app";
import firebaseui from "firebaseui";
import * as log from "loglevel";
import React, { FunctionComponent } from "react";
import { StyledFirebaseAuth } from "react-firebaseui";
import { useLocation } from "react-router-dom";
import { useWhitelistedUserFromAppAuthContext } from "../../services/auth/AppAuth";
import FirebaseAuthProvider from "../../services/auth/FirebaseAuthProvider";

interface LocationState {
  isPrivate: boolean;
  from: {
    pathname: string;
  };
}

export type FirebaseAuthComponentProps = {
  authProvider: FirebaseAuthProvider;
  googleAuthEnabled: boolean;
};

export const FirebaseAuthComponent: FunctionComponent<FirebaseAuthComponentProps> = ({
  authProvider,
  googleAuthEnabled,
}) => {
  const logger = log.getLogger("FirebaseAuthComponent");
  const location = useLocation<LocationState>();

  // Determine where the user should be redirected after login. If the user was
  // directed to the login page from a particular URL, they will be redirected
  // back there. If not, they will be redirected back to the default URL.
  const DEFAULT_POST_LOGIN_URL = "/";
  const postLoginRedirect = location.state ?? {
    isPrivate: false,
    from: {
      pathname: DEFAULT_POST_LOGIN_URL,
    },
  };

  const signInOptions = [firebase.auth.TwitterAuthProvider.PROVIDER_ID];
  if (googleAuthEnabled) {
    signInOptions.push(firebase.auth.GoogleAuthProvider.PROVIDER_ID);
  }
  const config: firebaseui.auth.Config = {
    signInOptions: signInOptions,
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
          `successful signin, got user ${authResult.user.uid} : ${authResult.user.displayName}`
        );

        return false;
      },
    },
    signInSuccessUrl: postLoginRedirect.from.pathname,
  };

  const loggedInUserRecord = useWhitelistedUserFromAppAuthContext();

  return (
    <Grid container direction="column" alignItems="center" justify="center">
      <Grid item>
        <StyledFirebaseAuth
          uiConfig={config}
          firebaseAuth={authProvider.auth}
        />
      </Grid>

      {!!loggedInUserRecord && (
        <Grid item>
          <Button color="primary" variant="contained" href="/profile">
            Click here to go to your profile, {loggedInUserRecord.username}
          </Button>
        </Grid>
      )}
    </Grid>
  );
};
