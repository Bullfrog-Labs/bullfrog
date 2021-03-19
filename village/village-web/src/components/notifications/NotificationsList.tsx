import { makeStyles } from "@material-ui/core";
import React, { CSSProperties } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";

const Row = (args: { index: number; style: CSSProperties }) => {
  return <div style={args.style}>Row {args.index}</div>;
};

const useStyles = makeStyles((theme) => ({
  container: {
    height: "100vh",
  },
}));

export type NotificationsListProps = {};

export const NotificationsList = (props: NotificationsListProps) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <AutoSizer>
        {({ height, width }) => {
          return (
            <FixedSizeList
              itemSize={60}
              itemCount={1000}
              height={height}
              width={width}
            >
              {Row}
            </FixedSizeList>
          );
        }}
      </AutoSizer>
    </div>
  );
};
