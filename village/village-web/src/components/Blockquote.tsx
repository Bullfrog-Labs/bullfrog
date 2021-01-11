import React, { ReactNode } from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  blockquote: {
    borderLeft: "4px solid",
    margin: "1em 0",
    paddingLeft: "1em",
    borderColor: theme.palette.secondary.dark,
  },
}));

export const Blockquote = (props: { children?: ReactNode }) => {
  const classes = useStyles();

  return (
    <blockquote className={classes.blockquote}>{props.children}</blockquote>
  );
};