import * as log from "loglevel";
import React from "react";
import { Paper, makeStyles, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import { useGlobalStyles } from "../styles/styles";

const useStyles = makeStyles(() => ({
  infoBox: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translateX(-50%) translateY(-50%)",
  },
}));

export default function MainView(props: any) {
  const logger = log.getLogger("MainView");
  const classes = useStyles();
  const globalClasses = useGlobalStyles();

  return (
    <Paper className={classes.infoBox} elevation={0}>
      <Typography variant="body1">Empty post</Typography>
      <Typography variant="body1">
        Press ⌘+U to create or open a post
      </Typography>
      <Typography variant="body1">
        Click{" "}
        <Link className={globalClasses.link} to={"/profile"}>
          here
        </Link>{" "}
        to go to your profile
      </Typography>
    </Paper>
  );
}
