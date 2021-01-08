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

import { useHotkeys } from "react-hotkeys-hook";
import { useAutocompleteSearchBoxModal } from "./search/AutocompleteSearchBox";

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

export default function AppContainer(props: { children: React.ReactNode }) {
  const classes = useStyles();
  const autocompleteSearchBox = useAutocompleteSearchBoxModal();

  useHotkeys("command+u", (event) => {
    event.preventDefault();
    autocompleteSearchBox.setModalOpen((v) => !v);
    // TODO: Need to somehow get the focus here
  });

  useHotkeys("escape", () => {
    autocompleteSearchBox.setModalOpen(false);
  });

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {autocompleteSearchBox.modal}
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
          <Container maxWidth="md">
            <div />
            {props.children}
          </Container>
        </main>
      </div>
    </MuiThemeProvider>
  );
}
