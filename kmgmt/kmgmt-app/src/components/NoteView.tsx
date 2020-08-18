import React from "react";
import Typography from "@material-ui/core/Typography";
import { Database } from "kmgmt-common";
import { Container } from "@material-ui/core";
import { useParams } from "react-router-dom";

export default function NoteView(props: { database: Database }) {
  const { id } = useParams();

  return (
    <Container maxWidth="md">
      <Typography variant="h1">This is a note view for note {id} </Typography>
      <Typography variant="body1">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Egestas dui id
        ornare arcu. Sed tempus urna et pharetra. Fermentum et sollicitudin ac
        orci phasellus egestas. Accumsan tortor posuere ac ut consequat semper
        viverra.
      </Typography>
    </Container>
  );
}
