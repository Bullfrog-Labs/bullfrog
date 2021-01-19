import React from "react";
import { Typography, Container, Link, Divider, Paper } from "@material-ui/core";
import { Blockquote } from "../components/Blockquote";
import { makeStyles } from "@material-ui/core/styles";
import { useGlobalStyles } from "../styles/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: "500",
  },
  blockquote: {
    borderLeft: "4px solid",
    margin: "1em 0",
    paddingLeft: "1em",
  },
  datePart: {
    color: theme.palette.grey[600],
    paddingLeft: "8px",
    display: "inline",
  },
  datePartBelow: {
    color: theme.palette.grey[600],
    fontWeight: "bold",
  },
  emptyMentionsLine: {
    fontWeight: 200,
  },
  card: {
    "&:hover": {
      backgroundColor: "#fafafa",
    },
    border: "0px",
  },
}));

export type TypographyViewProps = {};

export const TypographyView = ({}: TypographyViewProps) => {
  const classes = useStyles();
  const globalClasses = useGlobalStyles();

  const v1 = (
    <React.Fragment>
      <Paper className={classes.card} elevation={0}>
        <Typography variant="body1" style={{ fontWeight: "bold" }} gutterBottom>
          <Link className={globalClasses.link}>Misinformation</Link>
          <span className={classes.datePart}>December 4 2020</span>
        </Typography>
        <Typography paragraph={false} variant="body1">
          body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
          blanditiis tenetur unde suscipit, quam beatae rerum inventore
        </Typography>
        <Typography paragraph={true} variant="body1">
          ⋯
        </Typography>
      </Paper>
    </React.Fragment>
  );
  const v1LongTitle = (
    <React.Fragment>
      <Paper className={classes.card} elevation={0}>
        <Typography variant="body1" style={{ fontWeight: "bold" }} gutterBottom>
          <Link className={globalClasses.link} style={{ display: "inline" }}>
            All the News That's Fit to Sell: How the Market Transforms
            Information into News
          </Link>
          <span className={classes.datePart}>December 3 2020</span>
        </Typography>
        <Typography paragraph={false} variant="body1">
          body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
          blanditiis tenetur unde suscipit, quam beatae rerum inventore
        </Typography>
        <Typography paragraph={true} variant="body1">
          ⋯
        </Typography>
      </Paper>
    </React.Fragment>
  );
  const v1EmptyWithMentions = (
    <React.Fragment>
      <Typography variant="body1" style={{ fontWeight: "bold" }} gutterBottom>
        <Link className={globalClasses.link}>Misinformation</Link>
        <span className={classes.datePart}>December 4 2020</span>
      </Typography>
      <Typography
        paragraph={true}
        className={classes.emptyMentionsLine}
        variant="body2"
      >
        <em>5 Mentions</em>
      </Typography>
    </React.Fragment>
  );
  const v1EmptyWithMentionSimple = (
    <React.Fragment>
      <Typography
        variant="body1"
        style={{ fontWeight: "bold" }}
        paragraph={true}
      >
        <Link className={globalClasses.link}>Misinformation</Link>
        <span className={classes.datePart}>December 4 2020</span>
      </Typography>
    </React.Fragment>
  );
  const v1EmptyWithMentionSimpleCopy = (
    <React.Fragment>
      <Typography variant="body1" style={{ fontWeight: "bold" }} gutterBottom>
        <Link className={globalClasses.link}>Misinformation</Link>
        <span className={classes.datePart}>December 4 2020</span>
      </Typography>
      <Typography
        paragraph={true}
        className={classes.emptyMentionsLine}
        variant="body2"
      >
        <em>No content</em>
      </Typography>
    </React.Fragment>
  );

  const v2 = (
    <React.Fragment>
      <Typography variant="body1" style={{ fontWeight: "bold" }} gutterBottom>
        <Link className={globalClasses.link}>Misinformation</Link>{" "}
      </Typography>
      <Typography variant="body1" className={classes.datePartBelow}>
        <em>December 4 2020</em>
      </Typography>
      <Typography paragraph={false} variant="body1">
        body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
        blanditiis tenetur unde suscipit, quam beatae rerum inventore
      </Typography>
      <Typography paragraph={true} variant="body1">
        ⋯
      </Typography>
    </React.Fragment>
  );

  return (
    <Container maxWidth="sm">
      <div className={classes.root}>
        <Typography variant="h1" gutterBottom>
          h1. Heading
        </Typography>
        <br />
        <Typography variant="h2" gutterBottom>
          h2. Heading
        </Typography>
        <br />
        <Typography variant="h3" gutterBottom>
          h3. Heading
        </Typography>
        <br />
        <Typography variant="h4" gutterBottom>
          h4. Heading
        </Typography>
        <br />
        <Typography variant="h5" gutterBottom>
          h5. Heading
        </Typography>
        <Typography variant="h6" gutterBottom>
          h6. Heading
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          subtitle1. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          Quos blanditiis tenetur
        </Typography>
        <Typography variant="subtitle2" gutterBottom>
          subtitle2. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          Quos blanditiis tenetur
        </Typography>
        <Typography variant="body1" gutterBottom>
          body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
          blanditiis tenetur unde suscipit, quam beatae rerum inventore
          consectetur, neque doloribus, cupiditate numquam dignissimos laborum
          fugiat deleniti? Eum quasi quidem quibusdam.
        </Typography>
        <Typography variant="body2" gutterBottom>
          body2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
          blanditiis tenetur unde suscipit, quam beatae rerum inventore
          consectetur, neque doloribus, cupiditate numquam dignissimos laborum
          fugiat deleniti? Eum quasi quidem quibusdam.
        </Typography>
        <Typography variant="button" display="block" gutterBottom>
          button text
        </Typography>
        <Typography variant="caption" display="block" gutterBottom>
          caption text
        </Typography>
        <Typography variant="overline" display="block" gutterBottom>
          overline text
        </Typography>
        <Typography variant="body1" gutterBottom>
          <Blockquote>
            blockquote. Lorem ipsum dolor sit amet, consectetur adipisicing
            elit. Quos blanditiis tenetur unde suscipit, quam beatae rerum
            inventore consectetur, neque doloribus, cupiditate numquam
            dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.
          </Blockquote>
        </Typography>
        <Typography variant="body1" gutterBottom>
          <Link className={globalClasses.link}>links.</Link> Lorem ipsum dolor
          sit amet, consectetur adipisicing elit. Quos{" "}
          <Link className={globalClasses.link}>blanditiis</Link> tenetur unde
          suscipit, quam beatae rerum inventore consectetur, neque doloribus,
          cupiditate numquam dignissimos laborum fugiat deleniti? Eum quasi
          quidem quibusdam.
        </Typography>
        <Divider />
        <Typography variant="h6" gutterBottom>
          <Link className={globalClasses.link}>Misinformation</Link> - Dec 4
        </Typography>
        <Divider />
        <Typography variant="h6" gutterBottom>
          <Link className={globalClasses.link}>Misinformation</Link> - December
          4
        </Typography>
        <Divider />
        <Typography
          variant="body1"
          style={{ fontWeight: "normal" }}
          gutterBottom
        >
          <Link className={globalClasses.link}>Misinformation</Link> - December
          4
        </Typography>
        <Divider />
        <Typography variant="body1" style={{ fontWeight: "bold" }} gutterBottom>
          <Link className={globalClasses.link}>Misinformation</Link> - December
          4
        </Typography>
        <Typography variant="body1" style={{ fontWeight: "bold" }} gutterBottom>
          <Link className={globalClasses.link}>Misinformation</Link> - Dec 4
        </Typography>
        <Typography variant="body1" style={{ fontWeight: "bold" }} gutterBottom>
          <Link className={globalClasses.link}>Misinformation</Link> Dec 4
        </Typography>
        <Divider />
        {v1}
        {v1LongTitle}
        {v1EmptyWithMentionSimpleCopy}
        {v1}
        <Divider />
        {v2}
        {v2}
        {v2}
      </div>
    </Container>
  );
};
