import firebase from "firebase/app";
import firebaseui from "firebaseui";
import * as log from "loglevel";
import React, { FunctionComponent, useContext } from "react";
import { StyledFirebaseAuth } from "react-firebaseui";
import { Redirect, useHistory, useLocation } from "react-router-dom";
import {
  AppAuthContext,
  useAppAuthStatusFromAppAuthContext,
  useIsLoggedIn,
} from "../../services/auth/AppAuth";
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

  const appAuthState = useAppAuthStatusFromAppAuthContext();
  const redirectIsPrivate = postLoginRedirect.isPrivate;

  const userIsLoggedIn = useIsLoggedIn();
  const userCanAccessRedirect = redirectIsPrivate === userIsLoggedIn;

  const shouldRedirectToSignup =
    appAuthState.state === "not-whitelisted" && redirectIsPrivate;

  const authCompleted = useContext(AppAuthContext).authCompleted;
  if (authCompleted && userCanAccessRedirect) {
    // short-circuit because authState has been populated and there is no
    // need to get the user to authenticate manually via the auth component.
    logger.debug(`redirecting to ${postLoginRedirect.from.pathname}`);
    return <Redirect to={postLoginRedirect.from.pathname} />;
  } else if (authCompleted && shouldRedirectToSignup) {
    logger.debug(`redirecting to /signup because user is not whitelisted`);
    return <Redirect to={"/signup"} />;
  } else {
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

    return (
      <StyledFirebaseAuth uiConfig={config} firebaseAuth={authProvider.auth} />
    );
  }
};
