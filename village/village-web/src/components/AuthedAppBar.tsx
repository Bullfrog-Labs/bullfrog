import {
  AppBar,
  CssBaseline,
  IconButton,
  makeStyles,
  Slide,
  Toolbar,
  Tooltip,
  useScrollTrigger,
} from "@material-ui/core";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import HelpIcon from "@material-ui/icons/Help";
import NotificationsIcon from "@material-ui/icons/Notifications";
import React from "react";
import { useHistory } from "react-router";
import { helpURL, notificationsURL, profileURL } from "../routing/URLs";
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
            <Tooltip title="Help">
              <IconButton
                edge="end"
                color="inherit"
                aria-label="help"
                onClick={() => history.push(helpURL)}
              >
                <HelpIcon />
              </IconButton>
            </Tooltip>

            <div className={classes.grow} />

            <Tooltip title="Notifications">
              <IconButton
                color="inherit"
                aria-label="notifications"
                onClick={() => history.push(notificationsURL)}
              >
                <NotificationsIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Go to your profile">
              <IconButton
                edge="end"
                color="inherit"
                aria-label="go to your profile"
                onClick={() => history.push(profileURL(viewer.username))}
              >
                <AccountCircleIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
      </Slide>
    </React.Fragment>
  );
};
