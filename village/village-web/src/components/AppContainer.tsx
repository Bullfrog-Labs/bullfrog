import React from "react";
import {
  MuiThemeProvider,
  Container,
  CssBaseline,
  Divider,
  Drawer,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import theme from "../styles/theme";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  drawer: {
    flexShrink: 0,
  },
  drawerPaper: {},
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  drawerIcon: {
    minWidth: "0px",
  },
  menuButton: {
    marginRight: theme.spacing(2),
    color: theme.palette.primary.light,
  },
  title: {
    flexGrow: 1,
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
    color: theme.palette.secondary.light,
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
}));

// function AppBar

export default function AppContainer(props: { children: React.ReactNode }) {
  const classes = useStyles();
  const history = useHistory();

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <div className={classes.root}>
        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
          anchor="left"
        >
          <div className={classes.toolbar} />
          <Divider />
        </Drawer>
        <main className={classes.content}>
          <Container maxWidth="sm">
            <div />
            {props.children}
          </Container>
        </main>
      </div>
    </MuiThemeProvider>
  );
}
