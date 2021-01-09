import { makeStyles } from "@material-ui/core/styles";

export const useGlobalStyles = makeStyles((theme) => ({
  link: {
    color: theme.palette.secondary.dark,
    textDecoration: "none",
    verticalAlign: "baseline",
    display: "inline-block",
    "&:hover": {
      color: theme.palette.secondary.light,
    },
  },
  stackLink: {
    color: "black",
    textDecoration: "none",
    verticalAlign: "baseline",
    display: "inline-block",
    "&:hover": {
      color: "black",
    },
  },
}));
