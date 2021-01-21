import {
  Grid,
  Typography,
  List,
  ListItem,
  makeStyles,
} from "@material-ui/core";
import { MentionPostCard } from "../components/MentionPostCard";
import { MentionInContext } from "../components/richtext/Utils";
import { useGlobalStyles } from "../styles/styles";

const useStyles = makeStyles((theme) => ({
  postDetails: {
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(2),
  },
  mentionsHeading: {
    fontWeight: 700,
  },
}));

export const MentionsSection = (props: { mentions: MentionInContext[] }) => {
  const classes = useStyles();
  const { mentions } = props;
  const globalClasses = useGlobalStyles();

  const mentionListItems = mentions.map((mention) => {
    const mentionKey = `${mention.post.post.id}_${mention.path.join("_")}`;
    return (
      <ListItem
        alignItems="flex-start"
        key={mentionKey}
        className={globalClasses.cardListItem}
      >
        <MentionPostCard mention={mention} />
      </ListItem>
    );
  });

  return (
    <div className={classes.postDetails}>
      <Grid
        container
        direction="column"
        justify="flex-start"
        alignItems="stretch"
        spacing={4}
      >
        <Grid item>
          <Typography
            id="mentions"
            variant="body1"
            className={classes.mentionsHeading}
          >
            Mentions
          </Typography>
          <List dense={true}>{mentionListItems}</List>
        </Grid>
      </Grid>
    </div>
  );
};
