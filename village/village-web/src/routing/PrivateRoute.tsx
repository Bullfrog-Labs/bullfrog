import React from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import * as log from "loglevel";
import { AppAuthedComponent } from "../services/auth/AppAuth";

export default function PrivateRoute(props: RouteProps) {
  let { children, ...rest } = props;
  const logger = log.getLogger("PrivateRoute");

  return (
    <Route
      {...rest}
      render={({ location }) => (
        // check auth, if authed then render children, otherwise redirect to login
        <AppAuthedComponent
          withUser={(user) => {
            if (!!user) {
              logger.debug(`Accessing private route ${props.path}`);
              return <>{children}</>;
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
        />
      )}
    />
  );
}
