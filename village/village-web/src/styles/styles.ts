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
  cardListItem: {
    paddingLeft: "0px",
    paddingRight: "0px",
  },
  editableRichText: {
    "&:hover:not(:focus)": {
      backgroundColor: "#fafafa",
    },
  },
  readOnlyRichText: {},
  postPreviewCard: {
    "&:hover": {
      backgroundColor: "#fafafa",
    },
    border: "0px",
    width: "100%",
    padding: "0 0",
  },
  cardEmptyPreview: {
    fontWeight: 200,
  },
  cardTitle: {
    fontWeight: 700,
    display: "inline",
  },
  postSubtitle: {
    fontWeight: 700,
    display: "inline",
    color: "rgba(0, 0, 0, 0.54)",
  },
  cardTitleDatePart: {
    color: "rgba(0, 0, 0, 0.54)",
    paddingLeft: "8px",
    display: "inline",
  },
  cardUsernamePart: {
    fontWeight: 300,
    color: "grey",
  },
  cardNoContent: {
    color: theme.palette.grey[500],
  },
}));
