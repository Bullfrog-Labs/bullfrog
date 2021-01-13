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
  compactParagraph: {
    marginTop: "0px",
    marginBottom: "0px",
  },
  blockquote: {
    borderLeft: "4px solid",
    margin: "1em 0",
    paddingLeft: "1em",
    borderColor: theme.palette.secondary.dark,
  },
  compactBlockquote: {
    borderLeft: "4px solid",
    margin: "0 0",
    paddingLeft: "1em",
    borderColor: theme.palette.secondary.dark,
  },
}));
