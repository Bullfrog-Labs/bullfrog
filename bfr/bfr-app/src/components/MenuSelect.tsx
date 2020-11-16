import { MenuItem, makeStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import React from "react";

const useStyles = makeStyles((theme) => ({
  listToolbarButton: {
    margin: "4px",
  },
}));

export type MenuSelectItem = {
  id: string;
  value: string;
  buttonValue: string;
};

export const MenuSelect = (props: {
  items: readonly MenuSelectItem[];
  defaultValue: string;
  onItemSelect: (item: MenuSelectItem) => void;
}) => {
  const classes = useStyles();
  const { items, defaultValue, onItemSelect } = props;
  const itemValues = Object.fromEntries(items.map((item) => [item.id, item]));

  const [intervalMenuLabel, setIntervalMenuLabel] = React.useState<string>(
    defaultValue
  );

  const [anchorEl, setAnchorEl] = React.useState<
    (EventTarget & HTMLButtonElement) | undefined
  >();

  const handleButtonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>
  ) => {
    setIntervalMenuLabel(itemValues[event.currentTarget.id].buttonValue);
    onItemSelect(itemValues[event.currentTarget.id]);
    setAnchorEl(undefined);
  };

  const handleClose = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setAnchorEl(undefined);
  };

  const menuItems = items.map((item) => {
    return (
      <MenuItem id={item.id} onClick={handleMenuItemClick}>
        {item.value}
      </MenuItem>
    );
  });

  return (
    <React.Fragment>
      <Button
        aria-haspopup="true"
        onClick={handleButtonClick}
        className={classes.listToolbarButton}
      >
        {intervalMenuLabel}
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {menuItems}
      </Menu>
    </React.Fragment>
  );
};
