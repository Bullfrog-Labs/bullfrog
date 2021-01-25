import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  typography: {
    h1: {
      fontFamily: "Libre Caslon Text",
      fontWeight: 700,
      fontSize: "38px",
    },
    h2: {
      fontFamily: "Libre Caslon Text",
      fontWeight: 700,
      fontSize: "30px",
    },
    h3: {
      fontFamily: "Libre Caslon Text",
      fontWeight: 700,
      fontSize: "28px",
    },
    h4: {
      fontFamily: "Libre Caslon Text",
      fontSize: "24px",
    },
    h5: {
      fontFamily: "Libre Caslon Text",
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
      fontWeight: 400,
      fontSize: "1.01rem",
    },
    body2: {
      fontFamily: "Source Sans Pro",
      fontSize: "0.9rem",
    },
  },
  direction: "ltr",
  palette: {
    type: "light",
    background: {
      paper: "#fff",
      default: "#fff",
    },
    secondary: {
      main: "#FF9F1C",
    },
  },
});

export default theme;
