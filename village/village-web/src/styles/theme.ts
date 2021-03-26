import { createMuiTheme } from "@material-ui/core";

const theme = createMuiTheme({
  typography: {
    h1: {
      fontFamily: "Source Sans Pro",
      fontWeight: 700,
      fontSize: "38px",
    },
    h2: {
      fontFamily: "Source Sans Pro",
      fontWeight: 700,
      fontSize: "30px",
    },
    h3: {
      fontFamily: "Source Sans Pro",
      fontWeight: 700,
      fontSize: "26px",
    },
    h4: {
      fontFamily: "Source Sans Pro",
      fontSize: "24px",
    },
    h5: {
      fontFamily: "Source Sans Pro",
      fontSize: "20px",
    },
    h6: {
      fontFamily: "Source Sans Pro",
      fontSize: "20px",
      fontWeight: 700,
    },
    subtitle1: {
      fontFamily: "Source Sans Pro",
      fontSize: "1.01rem",
    },
    subtitle2: {
      fontFamily: "Source Sans Pro",
      fontSize: "0.9rem",
    },
    body1: {
      fontFamily: "Source Sans Pro",
      fontSize: "1.1rem",
    },
    body2: {
      fontFamily: "Source Sans Pro",
      fontSize: "1.08rem",
    },
  },
  direction: "ltr",
  palette: {
    type: "light",
    background: {
      paper: "#fff",
      default: "#fff",
    },
    primary: {
      main: "#C2EBFF",
    },
    secondary: {
      main: "#FF9F1C",
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 680,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

export default theme;
