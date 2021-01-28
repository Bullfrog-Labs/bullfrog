import { makeStyles } from "@material-ui/core/styles";

export const useGlobalStyles = makeStyles((theme) => {
  const link = {
    color: theme.palette.secondary.dark,
    textDecoration: "none",
    verticalAlign: "baseline",
    "&:hover": {
      color: theme.palette.secondary.light,
    },
  };

  return {
    link: link,
    activeSelectedLink: {
      ...link,
      boxShadow: "0 0 0 2px #B4D5FF",
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
        backgroundColor: theme.palette.action.selected,
      },
    },
    readOnlyRichText: {},
    postPreviewCard: {
      "&:hover": {
        backgroundColor: theme.palette.action.selected,
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
    loadingIndicator: {
      position: "fixed",
      top: "30%",
      left: "50%",
    },
    searchSuggestionLine: {
      fontWeight: "bold",
      width: "100%",
      display: "inline",
      whiteSpace: "nowrap",
      lineHeight: "1.8em",
    },
    searchPrefixPart: {
      fontWeight: 700,
      color: theme.palette.secondary.light,
    },
  };
});
