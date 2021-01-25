import { MentionNodeData } from "@blfrg.xyz/slate-plugins";
import { Typography } from "@material-ui/core";
import React from "react";
import { useGlobalStyles } from "../../styles/styles";

export const MentionSuggestionLine = (props: {
  option: MentionNodeData;
  uid: string;
}) => {
  const { option, uid } = props;
  const globalClasses = useGlobalStyles();
  if (!option.exists) {
    return (
      <Typography
        variant="body1"
        className={globalClasses.searchSuggestionLine}
      >
        <span className={globalClasses.searchPrefixPart}>New post: </span>{" "}
        {option.value}
      </Typography>
    );
  } else if (option.authorId === uid) {
    return (
      <Typography
        variant="body1"
        className={globalClasses.searchSuggestionLine}
      >
        {option.value}
      </Typography>
    );
  } else {
    return (
      <Typography
        variant="body1"
        className={globalClasses.searchSuggestionLine}
      >
        {option.value}{" "}
        <em style={{ fontWeight: 400 }}>by {option.authorUsername}</em>
      </Typography>
    );
  }
};
