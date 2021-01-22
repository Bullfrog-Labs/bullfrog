import React from "react";
import { NavigateToPostSuggestion } from "../../services/search/Suggestions";
import { UserRecord } from "../../services/store/Users";
import { makeStyles, Box, Tooltip, Typography } from "@material-ui/core";
import { useGlobalStyles } from "../../styles/styles";

const useStyles = makeStyles((theme) => ({}));

export type NavigateToPostSearchResultProps = {
  user: UserRecord;
  suggestion: NavigateToPostSuggestion;
};

export const NavigateToPostSearchResult = (
  props: NavigateToPostSearchResultProps
) => {
  const globalClasses = useGlobalStyles();
  const ownPost = props.user.uid === props.suggestion.authorId;
  const titlePartStr = props.suggestion.title;
  let authorPartStr = undefined;
  if (!ownPost) {
    authorPartStr = `by ${props.suggestion.authorUsername}`;
  }

  const textElement = (
    <React.Fragment>
      {titlePartStr}{" "}
      {authorPartStr && <em style={{ fontWeight: 400 }}>{authorPartStr}</em>}{" "}
    </React.Fragment>
  );

  const tooltip = `${titlePartStr} ${authorPartStr || ""}`;

  return (
    <Typography
      variant="body1"
      className={globalClasses.searchSuggestionLine}
      paragraph={false}
      component="div"
    >
      <Tooltip title={tooltip} placement="bottom-start">
        <Box textOverflow="ellipsis" overflow="hidden">
          {textElement}
        </Box>
      </Tooltip>
    </Typography>
  );
};
