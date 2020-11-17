import React from "react";
import {
  MuiThemeProvider,
  Container,
  CssBaseline,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
} from "@material-ui/core";
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import { createMuiTheme, makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";

const theme = createMuiTheme({
  direction: "ltr",
  palette: {
    type: "light",
    primary: {
      main: "#011627",
    },
    secondary: {
      main: "#FF9F1C",
    },
    error: {
      main: "#F71735",
    },
    info: {
      main: "#41EAD4",
    },
    success: {
      main: "#008148",
    },
  },
});

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

  const onInboxClick = () => {
    history.push("/pocket_imports");
  };

  const onLibraryClick = () => {
    history.push("/library");
  };

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
          <List>
            <ListItem
              button
              className={classes.drawerIcon}
              onClick={onInboxClick}
            >
              <ListItemIcon className={classes.drawerIcon}>
                <InboxIcon fontSize="large" className={classes.drawerIcon} />
              </ListItemIcon>
            </ListItem>
            <ListItem
              button
              className={classes.drawerIcon}
              onClick={onLibraryClick}
            >
              <ListItemIcon className={classes.drawerIcon}>
                <LibraryBooksIcon
                  fontSize="large"
                  className={classes.drawerIcon}
                />
              </ListItemIcon>
            </ListItem>
          </List>
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
