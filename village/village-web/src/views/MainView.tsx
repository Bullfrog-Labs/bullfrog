import * as log from "loglevel";
import React, { useContext } from "react";
import { Container } from "@material-ui/core";
import { AuthContext } from "../services/auth/Auth";

function EmptyUserStatePlaceholder() {
  return <div>"Welcome to Village!"</div>;
}

export default function MainView(props: any) {
  const logger = log.getLogger("MainView");
  const authState = useContext(AuthContext);

  return (
    <Container maxWidth="md">
      <EmptyUserStatePlaceholder />
    </Container>
  );
}
