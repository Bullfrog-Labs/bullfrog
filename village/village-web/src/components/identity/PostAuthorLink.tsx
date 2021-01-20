import React from "react";
import { Link } from "react-router-dom";
import { UserRecord } from "../../services/store/Users";
import { useGlobalStyles } from "../../styles/styles";
import { makeStyles, Typography, IconButton } from "@material-ui/core";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";

export type PostAuthorLinkProps = {
  viewer: UserRecord;
  author: UserRecord;
};

const useStyles = makeStyles((theme) => ({
  subtitlePart: {
    paddingLeft: theme.spacing(1),
  },
  toolbarButton: {
    padding: theme.spacing(0.5),
  },
}));

export const PostAuthorLink = (props: PostAuthorLinkProps) => {
  const userIsAuthor = props.viewer.uid === props.author.uid;
  const globalClasses = useGlobalStyles();
  const classes = useStyles();

  return (
    <Typography variant="subtitle2">
      <div>
        <Link
          className={globalClasses.link}
          to={`/profile/${props.author.uid}`}
        >
          <em>{props.author.displayName}</em>
        </Link>
        <span className={classes.subtitlePart}>Jan 21</span>
        <span className={classes.subtitlePart}>
          <IconButton className={classes.toolbarButton} size={"small"}>
            <LibraryBooksIcon fontSize={"inherit"} />
          </IconButton>
          <IconButton className={classes.toolbarButton} size={"small"}>
            <MoreHorizIcon fontSize={"inherit"} />
          </IconButton>
        </span>
      </div>
    </Typography>
  );
};
