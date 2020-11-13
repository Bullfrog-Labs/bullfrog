import { IconButton, Menu, MenuItem, makeStyles } from "@material-ui/core";
import { Duration } from "luxon";
import SnoozeIcon from "@material-ui/icons/Snooze";
import React from "react";

const useStyles = makeStyles((theme) => ({
  itemToolbarButton: {
    padding: "6px",
    float: "right",
  },
}));

const EMPTY_DURATION = Duration.fromObject({ minutes: 0 });

type SnoozeMenuItemsIDs =
  | "snooze-menu-button-none"
  | "snooze-menu-button-1minute"
  | "snooze-menu-button-1day"
  | "snooze-menu-button-1week";

export function SnoozeSelectButton(props: {
  onSnoozeItem: (snoozeDuration: Duration) => void;
}) {
  const classes = useStyles();
  const { onSnoozeItem } = props;
  const [anchorEl, setAnchorEl] = React.useState<
    (EventTarget & HTMLButtonElement) | undefined
  >();

  const handleButtonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setAnchorEl(undefined);
  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>
  ) => {
    const id = event.currentTarget.id;
    function toDuration(id: SnoozeMenuItemsIDs): Duration {
      switch (id) {
        case "snooze-menu-button-none":
          return EMPTY_DURATION;
        case "snooze-menu-button-1minute":
          return Duration.fromObject({ minutes: 1 });
        case "snooze-menu-button-1day":
          return Duration.fromObject({ days: 1 });
        case "snooze-menu-button-1week":
          return Duration.fromObject({ weeks: 1 });
        default:
          return EMPTY_DURATION;
      }
    }
    const duration = toDuration(id as SnoozeMenuItemsIDs);
    onSnoozeItem(duration);
  };

  return (
    <React.Fragment>
      <IconButton
        className={classes.itemToolbarButton}
        onClick={handleButtonClick}
      >
        <SnoozeIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem id="snooze-menu-button-none" onClick={handleMenuItemClick}>
          None
        </MenuItem>
        <MenuItem id="snooze-menu-button-1minute" onClick={handleMenuItemClick}>
          1 Minute
        </MenuItem>
        <MenuItem id="snooze-menu-button-1day" onClick={handleMenuItemClick}>
          1 Day
        </MenuItem>
        <MenuItem id="snooze-menu-button-1week" onClick={handleMenuItemClick}>
          1 Week
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
