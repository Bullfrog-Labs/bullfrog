import React, { FunctionComponent, useContext } from "react";
import * as log from "loglevel";
import firebase from "firebase/app";
import { StyledFirebaseAuth } from "react-firebaseui";
import firebaseui from "firebaseui";
import FirebaseAuthProvider from "../../services/auth/FirebaseAuthProvider";
import { useHistory, useLocation, Redirect } from "react-router-dom";
import { AppAuthContext, useIsLoggedIn } from "../../services/auth/AppAuth";

interface LocationState {
  isPrivate: boolean;
  from: {
    pathname: string;
  };
}

export type FirebaseAuthComponentProps = {
  authProvider: FirebaseAuthProvider;
};

export const FirebaseAuthComponent: FunctionComponent<FirebaseAuthComponentProps> = ({
  authProvider,
}) => {
  const logger = log.getLogger("FirebaseAuthComponent");

  const history = useHistory();
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

  const authCompleted = useContext(AppAuthContext).authCompleted;
  const redirectIsPrivate = postLoginRedirect.isPrivate;
  const userIsLoggedIn = useIsLoggedIn();
  const userCanAccessRedirect = redirectIsPrivate === userIsLoggedIn;

  if (authCompleted && userCanAccessRedirect) {
    // short-circuit because authState has been populated and there is no
    // need to get the user to authenticate manually via the auth component.
    logger.debug(`redirecting to ${postLoginRedirect.from.pathname}`);
    return <Redirect to={postLoginRedirect.from.pathname} />;
  } else {
    const config: firebaseui.auth.Config = {
      signInOptions: [firebase.auth.TwitterAuthProvider.PROVIDER_ID],
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
          logger.debug(`redirecting to ${postLoginRedirect.from.pathname}`);

          history.replace(postLoginRedirect.from);
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
