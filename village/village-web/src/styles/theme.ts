import { createMuiTheme } from "@material-ui/core/styles";
const theme = createMuiTheme({
  typography: {
    h4: {
      fontFamily: "Libre Caslon Text",
      fontWeight: 700,
    },
    h6: {
      fontFamily: "Libre Caslon Text",
      fontWeight: 400,
    },
    body1: {
      fontFamily: "Source Sans Pro",
      //fontFamily: "Libre Caslon Text",
      fontWeight: 400,
      fontSize: "1.01em",
    },
    body2: {
      fontFamily: "Source Sans Pro",
      fontSize: "1.01em",
    },
  },
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
export default theme;
