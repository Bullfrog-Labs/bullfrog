import React from "react";
import { Typography, Container, Link } from "@material-ui/core";
import { Blockquote } from "../components/Blockquote";
import { makeStyles } from "@material-ui/core/styles";
import { useGlobalStyles } from "../styles/styles";

const useStyles = makeStyles({
  root: {
    width: "100%",
    maxWidth: 500,
  },
  blockquote: {
    borderLeft: "4px solid",
    margin: "1em 0",
    paddingLeft: "1em",
  },
});

export type TypographyViewProps = {};

export const TypographyView = ({}: TypographyViewProps) => {
  const classes = useStyles();
  const globalClasses = useGlobalStyles();

  return (
    <Container maxWidth="sm">
      <div className={classes.root}>
        <Typography variant="h1" gutterBottom>
          h1. Heading
        </Typography>
        <br />
        <Typography variant="h2" gutterBottom>
          h2. Heading
        </Typography>
        <br />
        <Typography variant="h3" gutterBottom>
          h3. Heading
        </Typography>
        <br />
        <Typography variant="h4" gutterBottom>
          h4. Heading
        </Typography>
        <br />
        <Typography variant="h5" gutterBottom>
          h5. Heading
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          subtitle1. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          Quos blanditiis tenetur
        </Typography>
        <Typography variant="subtitle2" gutterBottom>
          subtitle2. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          Quos blanditiis tenetur
        </Typography>
        <Typography variant="body1" gutterBottom>
          body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
          blanditiis tenetur unde suscipit, quam beatae rerum inventore
          consectetur, neque doloribus, cupiditate numquam dignissimos laborum
          fugiat deleniti? Eum quasi quidem quibusdam.
        </Typography>
        <Typography variant="body2" gutterBottom>
          body2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
          blanditiis tenetur unde suscipit, quam beatae rerum inventore
          consectetur, neque doloribus, cupiditate numquam dignissimos laborum
          fugiat deleniti? Eum quasi quidem quibusdam.
        </Typography>
        <Typography variant="button" display="block" gutterBottom>
          button text
        </Typography>
        <Typography variant="caption" display="block" gutterBottom>
          caption text
        </Typography>
        <Typography variant="overline" display="block" gutterBottom>
          overline text
        </Typography>
        <Typography variant="body1" gutterBottom>
          <Blockquote>
            blockquote. Lorem ipsum dolor sit amet, consectetur adipisicing
            elit. Quos blanditiis tenetur unde suscipit, quam beatae rerum
            inventore consectetur, neque doloribus, cupiditate numquam
            dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.
          </Blockquote>
        </Typography>
        <Typography variant="body1" gutterBottom>
          <Link className={globalClasses.link}>links.</Link> Lorem ipsum dolor
          sit amet, consectetur adipisicing elit. Quos{" "}
          <Link className={globalClasses.link}>blanditiis</Link> tenetur unde
          suscipit, quam beatae rerum inventore consectetur, neque doloribus,
          cupiditate numquam dignissimos laborum fugiat deleniti? Eum quasi
          quidem quibusdam.
        </Typography>
      </div>
    </Container>
  );
};