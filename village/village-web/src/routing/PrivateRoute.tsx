import React from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import * as log from "loglevel";
import { AppAuthContext } from "../services/auth/AppAuthContext";

export default function PrivateRoute(props: RouteProps) {
  let { children, ...rest } = props;
  const logger = log.getLogger("PrivateRoute");

  return (
    <Route
      {...rest}
      render={({ location }) => (
        // check auth, if authed then render children, otherwise redirect to login
        <AppAuthContext.Consumer>
          {({ authProviderState }) => {
            logger.debug(`Accessing private route ${props.path}`);
            if (authProviderState) {
              return children;
            } else {
              logger.debug(
                `User not authenticated for private route ${props.path}, redirecting to login`
              );
              return (
                <Redirect
                  to={{
                    pathname: "/login",
                    state: { from: location },
                  }}
                />
              );
            }
          }}
        </AppAuthContext.Consumer>
      )}
    />
  );
}
