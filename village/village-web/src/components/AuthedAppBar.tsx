import {
  AppBar,
  CssBaseline,
  IconButton,
  makeStyles,
  Slide,
  Toolbar,
  useScrollTrigger,
} from "@material-ui/core";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import MenuIcon from "@material-ui/icons/Menu";
import NotificationsIcon from "@material-ui/icons/Notifications";
import React from "react";
import { useHistory } from "react-router";
import { notificationsURL, profileURL } from "../routing/URLs";
import { useLoggedInUserFromAppAuthContext } from "../services/auth/AppAuth";

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
}));

export type AuthedAppBarProps = {};

export const AuthedAppBar = (props: AuthedAppBarProps) => {
  const classes = useStyles();
  const trigger = useScrollTrigger();
  const history = useHistory();
  const viewer = useLoggedInUserFromAppAuthContext();

  return (
    <React.Fragment>
      <CssBaseline />
      <Slide appear={false} direction="down" in={!trigger}>
        <AppBar color="primary" elevation={0}>
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu">
              <MenuIcon />
            </IconButton>
            <div className={classes.grow} />
            <IconButton
              color="inherit"
              onClick={() => history.push(notificationsURL)}
            >
              <NotificationsIcon />
            </IconButton>
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => history.push(profileURL(viewer.username))}
            >
              <AccountCircleIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </Slide>
    </React.Fragment>
  );
};
