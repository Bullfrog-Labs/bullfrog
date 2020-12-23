import { createMuiTheme } from "@material-ui/core/styles";
const theme = createMuiTheme({
  typography: {
    h4: {
      fontFamily: "Libre Caslon Text",
    },
    h6: {
      fontFamily: "Domine",
      fontWeight: 700,
    },
    body1: {
      fontFamily: "Libre Caslon Text",
      fontSize: "1.1rem",
    },
  },
});
export default theme;
