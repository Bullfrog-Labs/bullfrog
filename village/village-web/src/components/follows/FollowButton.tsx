import {
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
} from "@material-ui/core";
import LibraryAddIcon from "@material-ui/icons/LibraryAdd";
import LibraryAddCheckIcon from "@material-ui/icons/LibraryAddCheck";
import React, { useState } from "react";

export type FollowButtonProps = {
  isFollowed: boolean;
  onClick: (isFollowed: boolean) => Promise<void>;
  tooltip: {
    followed: string;
    notFollowed: string;
  };
};

export const FollowButton = (props: FollowButtonProps) => {
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
    return <CircularProgress size={theme.spacing(2.25)} />;
  }

  return (
    <Tooltip title={tooltip}>
      <IconButton size="small" style={{ marginLeft: "-3px" }} onClick={onClick}>
        {props.isFollowed ? (
          <LibraryAddCheckIcon fontSize={"inherit"} />
        ) : (
          <LibraryAddIcon fontSize={"inherit"} />
        )}
      </IconButton>
    </Tooltip>
  );
};
