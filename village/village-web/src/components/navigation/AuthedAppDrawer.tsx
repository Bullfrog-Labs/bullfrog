import {
  Drawer,
  Divider,
  makeStyles,
  createStyles,
  useTheme,
  IconButton,
  List,
  ListItemIcon,
  ListItemText,
  ListItem,
  Grid,
  Box,
} from "@material-ui/core";
import React, { useState } from "react";
import clsx from "clsx";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import NotificationsIcon from "@material-ui/icons/Notifications";

const drawerWidth = 30;

const useStyles = makeStyles((theme) =>
  createStyles({
    drawer: {
      flexShrink: 0,
      width: theme.spacing(drawerWidth),
      whiteSpace: "nowrap",
    },

    drawerOpen: {
      width: theme.spacing(drawerWidth),
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerClose: {
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: "hidden",
      width: theme.spacing(7) + 1,
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(7) + 1,
      },
    },

    drawerPaper: {
      height: "100vh",
    },

    toolbar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      padding: theme.spacing(0, 0.5),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
    },

    drawerIcon: {
      minWidth: "0px",
    },
  })
);

export type AuthedAppDrawerProps = {};

export const AuthedAppDrawer = (props: AuthedAppDrawerProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const [openDrawerIcon, closeDrawerIcon] =
    theme.direction === "rtl"
      ? [<ChevronLeftIcon />, <ChevronRightIcon />]
      : [<ChevronRightIcon />, <ChevronLeftIcon />];

  return (
    <Drawer
      variant="permanent"
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: open,
        [classes.drawerClose]: !open,
      })}
      classes={{
        paper: clsx({
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        }),
      }}
      anchor="left"
    >
      <div className={classes.toolbar}>
        <IconButton
          onClick={() => {
            open ? handleDrawerClose() : handleDrawerOpen();
          }}
        >
          {open ? closeDrawerIcon : openDrawerIcon}
        </IconButton>
      </div>
      <Divider />

      <Grid
        container
        direction="column"
        justify="flex-end"
        alignItems="stretch"
        className={classes.drawerPaper}
      >
        <Grid item>
          <List>
            <ListItem button key={"Notifications"}>
              <ListItemIcon>
                <NotificationsIcon />
              </ListItemIcon>
              <ListItemText primary="Notifications" />
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </Drawer>
  );
};
