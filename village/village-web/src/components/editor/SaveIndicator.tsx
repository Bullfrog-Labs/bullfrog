import {
  CircularProgress,
  Grid,
  makeStyles,
  Snackbar,
  Theme,
  Typography,
  useTheme,
} from "@material-ui/core";
import CheckIcon from "@material-ui/icons/Check";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import React, { useState } from "react";
import { useGlobalStyles } from "../../styles/styles";
import { assertNever } from "../../utils";

export type AllChangesSaved = "all-changes-saved";
export type ChangesUnsaved = "changes-unsaved";
export type SavingChanges = "saving-changes";

export type SaveStatus = AllChangesSaved | ChangesUnsaved | SavingChanges;

export type SaveIndicatorProps = {
  open: boolean;
  setOpen: (newOpen: boolean) => void;
  state: SaveStatus;
};

const ICON_SIZE_SPACES = 3;

const useStyles = makeStyles((theme: Theme) => ({
  messageIcon: {
    paddingRight: theme.spacing(1),
    height: theme.spacing(ICON_SIZE_SPACES),
  },
}));

const SaveIndicatorSnackbarMessage = (props: SaveIndicatorProps) => {
  const globalClasses = useGlobalStyles();
  const classes = useStyles();
  const theme = useTheme();

  const getIcon = () => {
    switch (props.state) {
      case "all-changes-saved":
        return <CheckIcon />;
      case "changes-unsaved":
        return <HourglassEmptyIcon />;
      case "saving-changes":
        return (
          <CircularProgress
            size={theme.spacing(ICON_SIZE_SPACES)}
            className={globalClasses.circularProgress}
          />
        );
      default:
        assertNever(props.state);
    }
  };
  const icon = getIcon();

  const getMessage = () => {
    switch (props.state) {
      case "all-changes-saved":
        return "All changes saved";
      case "changes-unsaved":
        return "Unsaved changes";
      case "saving-changes":
        return "Saving changes";
      default:
        assertNever(props.state);
    }
  };

  return (
    <Grid container direction="row" justify="space-evenly" alignItems="center">
      <Grid item className={classes.messageIcon}>
        {icon}
      </Grid>
      <Grid item>
        <Typography variant="body2">{getMessage()}</Typography>
      </Grid>
    </Grid>
  );
};

const AUTO_HIDE_DURATION_ON_SAVED = 1000;

export const SaveIndicator = (props: SaveIndicatorProps) => {
  const onClose = () => {
    props.setOpen(false);
  };

  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={props.open}
      onClose={onClose}
      autoHideDuration={
        props.state === "all-changes-saved" ? AUTO_HIDE_DURATION_ON_SAVED : null
      }
      message={<SaveIndicatorSnackbarMessage {...props} />}
    />
  );
};

type SaveIndicatorState = {
  open: [boolean, (newOpen: boolean) => void];
  saveStatus: [SaveStatus, (newSaveStatus: SaveStatus) => void];
};

export const useSaveIndicatorState = (): SaveIndicatorState => {
  const [open, setOpen] = useState(false);
  const [saveStatus, setSaveStatusInner] = useState<SaveStatus>(
    "all-changes-saved"
  );

  const setSaveStatus = (newSaveStatus: SaveStatus) => {
    setSaveStatusInner(newSaveStatus);
    if (newSaveStatus !== "all-changes-saved") {
      setOpen(true);
    }
  };

  return {
    open: [open, setOpen],
    saveStatus: [saveStatus, setSaveStatus],
  };
};
