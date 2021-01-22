import { Container } from "@material-ui/core";
import React from "react";

function EmptyUserStatePlaceholder() {
  return <div>"Welcome to Village!"</div>;
}

export default function MainView() {
  return (
    <Container maxWidth="md">
      <EmptyUserStatePlaceholder />
    </Container>
  );
}
