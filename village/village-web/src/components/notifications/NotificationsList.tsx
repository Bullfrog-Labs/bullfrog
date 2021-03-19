import { makeStyles } from "@material-ui/core";
import React, { CSSProperties } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import { Activity } from "../../services/activities/Types";
import {
  CursoredActivity,
  getActivitiesFromFeed,
} from "../../services/store/Activities";
import { ActivityNotification } from "./ActivityNotification";

const useStyles = makeStyles((theme) => ({
  container: {
    height: "100vh",
  },
}));
const DEFAULT_NOTIFICATION_ITEM_COUNT = 1000;

// let cursoredActivities: CursoredActivity[] = [];
let cursoredActivities: number[] = [];

const NotificationListRow = (args: { index: number; style: CSSProperties }) => {
  const activity = cursoredActivities[args.index];
  return (
    <div style={args.style}>
      <ActivityNotification activity={activity} />
    </div>
  );
};

const isItemLoaded = (index: number): boolean => !!cursoredActivities[index];

const loadMoreItems = async (startIndex: number, stopIndex: number) => {
  const result = [];
  const limit = stopIndex - startIndex + 1;
  for (let index = 0; index <= limit; ++index) {
    result.push(index);
  }

  for (let index = startIndex; index <= stopIndex; ++index) {
    cursoredActivities[index] = result[index - startIndex];
  }

  /*
  // indexing between startIndex and stopIndex is inclusive of both endpoints
  const cursor = cursoredActivities[startIndex].cursor;
  const limit = stopIndex - startIndex + 1;
  const result = await getActivitiesFromFeed(cursor, limit);

  // Is there a nicer way to write this?
  for (let index = startIndex; index <= stopIndex; ++index) {
    cursoredActivities[index] = result[index - startIndex];
  }
  */
};

export type NotificationsListProps = {};

export const NotificationsList = (props: NotificationsListProps) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <AutoSizer>
        {({ height, width }) => {
          return (
            <InfiniteLoader
              isItemLoaded={isItemLoaded}
              itemCount={DEFAULT_NOTIFICATION_ITEM_COUNT}
              loadMoreItems={loadMoreItems}
            >
              {({ onItemsRendered, ref }) => (
                <FixedSizeList
                  ref={ref}
                  itemSize={60}
                  itemCount={1000}
                  height={height}
                  width={width}
                  onItemsRendered={onItemsRendered}
                >
                  {NotificationListRow}
                </FixedSizeList>
              )}
            </InfiniteLoader>
          );
        }}
      </AutoSizer>
    </div>
  );
};
