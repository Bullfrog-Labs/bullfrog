import * as log from "loglevel";
import React from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";
import { useAppAuthStatusFromAppAuthContext } from "../services/auth/AppAuth";
import { assertNever } from "../utils";

export default function PrivateRoute(props: RouteProps) {
  const { children, ...rest } = props;
  const logger = log.getLogger("PrivateRoute");

  const appAuthStatus = useAppAuthStatusFromAppAuthContext();

  return (
    <Route
      {...rest}
      render={({ location }) => {
        switch (appAuthStatus.state) {
          case "whitelisted":
            logger.debug(`Accessing private route ${props.path}`);
            return <>{children}</>;
          case "not-whitelisted":
            return (
              <Redirect
                to={{
                  pathname: "/signup",
                  state: { from: location, isPrivate: true },
                }}
              />
            );
          case "not-logged-in":
            logger.debug(
              `User not authenticated for private route ${props.path}, redirecting to login`
            );
            return (
              <Redirect
                to={{
                  pathname: "/login",
                  state: { from: location, isPrivate: true },
                }}
              />
            );
          default:
            assertNever(appAuthStatus);
        }
      }}
    />
  );
}
