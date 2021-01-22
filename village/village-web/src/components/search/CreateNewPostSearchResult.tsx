import { PostTitle } from "../../services/store/Posts";
import { Box, Typography, Tooltip, makeStyles } from "@material-ui/core";
import { useGlobalStyles } from "../../styles/styles";

const useStyles = makeStyles((theme) => ({
  prefixPart: {
    fontWeight: 700,
    color: theme.palette.secondary.light,
  },
}));

export type CreateNewPostSearchResultProps = {
  title: PostTitle;
};

export const CreateNewPostSearchResult = (
  props: CreateNewPostSearchResultProps
) => {
  const classes = useStyles();
  const globalClasses = useGlobalStyles();
  const prompt = `New post: ${props.title}`;
  return (
    <Typography
      variant="body1"
      paragraph={false}
      className={globalClasses.searchSuggestionLine}
      component="div"
    >
      <Tooltip title={prompt} placement="bottom-start">
        <Box textOverflow="ellipsis" overflow="hidden">
          <span className={classes.prefixPart}>New post:</span> {props.title}
        </Box>
      </Tooltip>
    </Typography>
  );
};
