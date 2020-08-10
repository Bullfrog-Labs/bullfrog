import React from "react";
import { Route, Redirect } from "react-router-dom";
import { AuthContext } from "../services/Auth";
import * as log from "loglevel";

export default function PrivateRoute(props: {
  children: React.ReactChild[] | React.ReactChild;
  path: string[] | string;
}) {
  let { children, ...rest } = props;
  const logger = log.getLogger("PrivateRoute");

  return (
    <Route
      {...rest}
      render={({ location }) => (
        // check auth, if authed then render children, otherwise redirect to login
        <AuthContext.Consumer>
          {(authState) => {
            logger.debug(`Accessing private route ${props.path}`);
            if (authState) {
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
        </AuthContext.Consumer>
      )}
    />
  );
}
