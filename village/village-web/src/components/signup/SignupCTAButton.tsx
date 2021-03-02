import { Button, Grid, CircularProgress, useTheme } from "@material-ui/core";
import React from "react";
import { makeStyles } from "@material-ui/core";
import EmojiPeopleIcon from "@material-ui/icons/EmojiPeople";

const useStyles = makeStyles((theme) => ({
  button: {
    height: theme.spacing(5),
  },
  ctaIcon: {
    marginRight: theme.spacing(1),
  },
  progressIndicator: {
    marginRight: theme.spacing(1.5),
    marginTop: theme.spacing(0.5),
  },
}));

export type SignupCTAButtonProps = {
  typeformPopupOpening: boolean;
  openTypeformPopup: () => void;
};

export const SignupCTAButton = (props: SignupCTAButtonProps) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Button
      variant="contained"
      color="secondary"
      onClick={props.openTypeformPopup}
      className={classes.button}
    >
      <Grid
        container
        direction="row"
        justify="space-evenly"
        alignItems="center"
      >
        {props.typeformPopupOpening ? (
          <Grid item className={classes.progressIndicator}>
            <CircularProgress size={theme.spacing(2)} />
          </Grid>
        ) : (
          <Grid item className={classes.ctaIcon}>
            <EmojiPeopleIcon fontSize={"small"} />
          </Grid>
        )}
        <Grid item>Sign up for early access</Grid>
      </Grid>
    </Button>
  );
};
