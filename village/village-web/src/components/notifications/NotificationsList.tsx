import React, { CSSProperties } from "react";
import { FixedSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

const Row = (args: { index: number; style: CSSProperties }) => {
  return <div style={args.style}>Row {args.index}</div>;
};

const NOTIFICATION_LIST_DEFAULT_HEIGHT = 1000;

export type NotificationsListProps = {};

export const NotificationsList = (props: NotificationsListProps) => {
  return (
    <div style={{ height: "100%", overflowX: "hidden" }}>
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ flex: "1 1 auto", height: "100%" }}>
          <AutoSizer disableHeight>
            {({ height, width }) => {
              console.log(height);
              console.log(window.innerHeight);
              const actualHeight = height ?? NOTIFICATION_LIST_DEFAULT_HEIGHT;
              return (
                <FixedSizeList
                  itemSize={60}
                  itemCount={1000}
                  height={actualHeight}
                  width={width}
                >
                  {Row}
                </FixedSizeList>
              );
            }}
          </AutoSizer>
        </div>
      </div>
    </div>
  );
};
