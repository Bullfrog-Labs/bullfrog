import React from "react";
import Typography from "@material-ui/core/Typography";
import { Database } from "../services/Database";
import { Container } from "@material-ui/core";
import { useParams } from "react-router-dom";
import RichTextEditor from "./richtext/RichTextEditor";

export default function NoteView(props: { database: Database }) {
  const { id } = useParams();

  return (
    <Container maxWidth="md">
      <RichTextEditor />
    </Container>
  );
}
