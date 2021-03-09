import { Fab, makeStyles } from "@material-ui/core";
import React from "react";
import CreateIcon from "@material-ui/icons/Create";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: 9999,
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
}));

const SEARCH_OR_CREATE_FAB_LABEL = "Search or create";

export type SearchOrCreateFabProps = {
  onClick: () => void;
};

export const SearchOrCreateFab = (props: SearchOrCreateFabProps) => {
  const classes = useStyles();
  return (
    <Fab
      className={classes.root}
      color="secondary"
      aria-label={SEARCH_OR_CREATE_FAB_LABEL}
      variant="extended"
      onClick={props.onClick}
    >
      <CreateIcon className={classes.extendedIcon} />
      {SEARCH_OR_CREATE_FAB_LABEL}
    </Fab>
  );
};
