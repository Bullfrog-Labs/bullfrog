import React, { useState } from "react";
import { Link } from "react-router-dom";
import { UserRecord } from "../services/store/Users";
import { useGlobalStyles } from "../styles/styles";
import {
  makeStyles,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
} from "@material-ui/core";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import CallReceivedIcon from "@material-ui/icons/CallReceived";
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";
import DeleteIcon from "@material-ui/icons/Delete";
import { DateTime } from "luxon";
import { HashLink } from "react-router-hash-link";
import { profileURL } from "../routing/URLs";

export type PostSubtitleRowProps = {
  viewer: UserRecord;
  author: UserRecord;
  postTitle: string;
  postId: string;
  updatedAt: Date | undefined;
  numMentions: number;
};

const useStyles = makeStyles((theme) => ({
  subtitlePart: {
    marginLeft: theme.spacing(1.5),
  },
  subtitleMoreMenuItem: {
    color: "rgba(0, 0, 0, 0.54)",
  },
  subtitleMoreMenuItemText: {
    color: "rgba(0, 0, 0, 0.54)",
    paddingLeft: theme.spacing(1),
  },
}));

export const PostSubtitleRow = (props: PostSubtitleRowProps) => {
  const globalClasses = useGlobalStyles();
  const classes = useStyles();
  const dt = DateTime.fromJSDate(props.updatedAt || new Date());
  const isLoggedIn = props.author.uid === props.viewer.uid;
  const stackURLPath = `/stack/${encodeURIComponent(props.postTitle)}`;
  const postHasMentions = props.numMentions;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Typography
      variant="body1"
      className={globalClasses.postSubtitle}
      paragraph={false}
      component="div"
    >
      <div>
        <Link
          className={globalClasses.link}
          to={profileURL(props.author.username)}
        >
          <em>{props.author.displayName}</em>
        </Link>
        <span className={classes.subtitlePart}>{dt.toFormat("MMM d")}</span>
        <span className={classes.subtitlePart}>
          <Tooltip title="View stack">
            <Link className={globalClasses.link} to={stackURLPath}>
              <IconButton size="small" style={{ marginLeft: "-3px" }}>
                <LibraryBooksIcon fontSize={"inherit"} />
              </IconButton>
            </Link>
          </Tooltip>
          <Tooltip title="View mentions">
            <HashLink smooth className={globalClasses.link} to={`#mentions`}>
              <IconButton
                size="small"
                style={{ marginLeft: "-3px" }}
                disabled={!postHasMentions}
              >
                <CallReceivedIcon fontSize={"inherit"} />
              </IconButton>
            </HashLink>
          </Tooltip>
          {isLoggedIn && (
            <React.Fragment>
              <Tooltip title="Delete, settings, and more...">
                <IconButton
                  size="small"
                  style={{ marginLeft: "-3px" }}
                  onClick={handleClick}
                >
                  <MoreHorizIcon fontSize={"inherit"} />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem dense onClick={handleClose}>
                  <DeleteIcon
                    fontSize="small"
                    className={classes.subtitleMoreMenuItem}
                  />
                  <span className={classes.subtitleMoreMenuItemText}>
                    Delete
                  </span>
                </MenuItem>
              </Menu>
            </React.Fragment>
          )}
        </span>
      </div>
    </Typography>
  );
};
