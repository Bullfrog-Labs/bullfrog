import React from "react";

import { Route } from "react-router-dom";

export default function PrivateRoute(props: { children: React.ReactChild[] }) {
  let { children, ...rest } = props;

  // { children: React.ReactChild[], ...rest }
  /*
  return (
    <Route
      {...rest}
      render={({ location }) =>
        // check auth, if authed then render children, otherwise redirect to login
      }
    />
  )
    */
  return;
}
