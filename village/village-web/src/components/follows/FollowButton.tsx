import {
  CircularProgress,
  IconButton,
  makeStyles,
  Tooltip,
  useTheme,
} from "@material-ui/core";
import LibraryAddIcon from "@material-ui/icons/LibraryAdd";
import LibraryAddCheckIcon from "@material-ui/icons/LibraryAddCheck";
import React, { useState } from "react";
import { useGlobalStyles } from "../../styles/styles";

const useStyles = makeStyles((theme) => ({
  progressIndicator: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
  },
}));

export type FollowButtonProps = {
  isFollowed: boolean;
  onClick: (isFollowed: boolean) => Promise<void>;
  tooltip: {
    followed: string;
    notFollowed: string;
  };
};

export const FollowButton = (props: FollowButtonProps) => {
  const globalClasses = useGlobalStyles();
  const classes = useStyles();
  const theme = useTheme();

  const tooltip = props.isFollowed
    ? props.tooltip.followed
    : props.tooltip.notFollowed;
  const [isWaitingOnAPICall, setIsWaitingOnAPICall] = useState(false);

  const onClick = async () => {
    setIsWaitingOnAPICall(true);
    await props.onClick(props.isFollowed);
    setIsWaitingOnAPICall(false);
  };

  if (isWaitingOnAPICall) {
    return (
      <div className={classes.progressIndicator}>
        <CircularProgress
          size={theme.spacing(2)}
          className={globalClasses.circularProgress}
        />
      </div>
    );
  }

  return (
    <Tooltip title={tooltip}>
      <IconButton size="small" onClick={onClick}>
        {props.isFollowed ? (
          <LibraryAddCheckIcon fontSize={"inherit"} />
        ) : (
          <LibraryAddIcon fontSize={"inherit"} />
        )}
      </IconButton>
    </Tooltip>
  );
};
