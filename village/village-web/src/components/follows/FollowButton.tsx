import { IconButton, Tooltip } from "@material-ui/core";
import LibraryAddIcon from "@material-ui/icons/LibraryAdd";
import LibraryAddCheckIcon from "@material-ui/icons/LibraryAddCheck";
import React from "react";

export type FollowButtonProps = {
  isFollowed: boolean;
  onClick: (isFollowed: boolean) => void;
  tooltip: {
    followed: string;
    notFollowed: string;
  };
};

export const FollowButton = (props: FollowButtonProps) => {
  const tooltip = props.isFollowed
    ? props.tooltip.followed
    : props.tooltip.notFollowed;
  return (
    <Tooltip title={tooltip}>
      <IconButton
        size="small"
        style={{ marginLeft: "-3px" }}
        onClick={() => props.onClick(props.isFollowed)}
      >
        {!!props.isFollowed ? (
          <LibraryAddCheckIcon fontSize={"inherit"} />
        ) : (
          <LibraryAddIcon fontSize={"inherit"} />
        )}
      </IconButton>
    </Tooltip>
  );
};
