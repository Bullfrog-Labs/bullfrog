import * as log from "loglevel";
import React, { useContext } from "react";
import { Container, Typography } from "@material-ui/core";
import { AuthContext } from "../services/auth/Auth";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { PostRecord } from "../services/VillageController";

const useStyles = makeStyles((theme) => ({
  root: {},
  inline: {
    display: "inline",
  },
  profileDivider: {
    margin: "10px 0 0 0",
  },
}));

export default function MainView(props: {}) {
  const logger = log.getLogger("MainView");
  const authState = useContext(AuthContext);
  const classes = useStyles();

  return (
    <Container maxWidth="sm">
      <Typography variant="h4">Leigh Stewart</Typography>
      <Typography variant="body1">
        I am a French naval officer, explorer, conservationist, filmmaker,
        innovator, scientist, photographer, author and researcher who studies
        the sea and all forms of life in water. Beleieve it or not, I
        co-developed the Aqua-Lung, pioneered marine conservation and was a
        member of the Académie française.
      </Typography>
      <Divider className={classes.profileDivider} />
      <List className={classes.root}>
        <ListItem alignItems="flex-start">
          <ListItemText
            primary="Curators are the new Creators"
            secondary={
              <React.Fragment>
                {
                  "Newsletters have def become a primary curation tool. Not clear to me why they are so different from blogs. People have argued the subscription changes everything."
                }
              </React.Fragment>
            }
          />
        </ListItem>
      </List>
    </Container>
  );
}
