import React from "react";
import {
  MuiThemeProvider,
  Typography,
  IconButton,
  Toolbar,
  AppBar,
  Container,
  CssBaseline,
  InputBase,
  Box,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";
import { createMuiTheme, fade, makeStyles } from "@material-ui/core/styles";

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
    flexGrow: 1,
  },
  appBar: {
    margin: "0px",
    [theme.breakpoints.up("md")]: {
      width: "400px",
      position: "fixed",
      top: "40px",
      right: "40px",
    },
    [theme.breakpoints.down("sm")]: {
      position: "static",
    },
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
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
  textfield: {
    "& textarea": {
      border: "0px solid",
    },
    "& textarea:hover": {
      border: "0px solid",
    },
    "& textarea:focus": {
      border: "0px solid",
    },
  },
}));

export default function AppContainer(props: { children: React.ReactNode }) {
  const classes = useStyles();
  return (
    <MuiThemeProvider theme={theme}>
      <div className={classes.root}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton
              edge="start"
              className={classes.menuButton}
              aria-label="open drawer"
            >
              <MenuIcon />
            </IconButton>
            <Typography className={classes.title} variant="h4" noWrap>
              kmgmt
            </Typography>
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder="Search…"
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                inputProps={{ "aria-label": "search" }}
              />
            </div>
          </Toolbar>
        </AppBar>
        <Container>
          <CssBaseline />
          {props.children}
        </Container>
      </div>
    </MuiThemeProvider>
  );
}
