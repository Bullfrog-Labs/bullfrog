import { CircularProgress, makeStyles } from "@material-ui/core";
import React, { CSSProperties, useCallback, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import {
  CursoredActivity,
  getCursoredActivitiesFromFeed,
} from "../../services/store/Activities";

const useStyles = makeStyles((theme) => ({
  container: {
    height: "100vh",
  },
}));

const NotificationListRow = (args: { index: number; style: CSSProperties }) => {
  /*
  const activity = cursoredActivities[args.index].activity;

  return (
    <div style={args.style}>
      <ActivityNotification activity={activity} />
    </div>
  );
  */
  console.log(args.index);
  return <div style={args.style}>Row {args.index}</div>;
};

type NotificationListState = {
  isItemLoaded: (index: number) => boolean;
  cursoredActivities: CursoredActivity[];
  itemCount: number;
  loadMoreItems: (startIndex: number, stopIndex: number) => Promise<void>;
};

const useNotificationsListState = (
  minimumBatchSize: number
): NotificationListState => {
  const [cursoredActivities, setCursoredActivities] = useState<
    CursoredActivity[]
  >([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const itemCount = hasNextPage
    ? cursoredActivities.length + 1
    : cursoredActivities.length;

  const isItemLoaded = useCallback(
    (index: number): boolean => {
      if (!hasNextPage) {
        return true;
      }
      return index < cursoredActivities.length;
    },
    [cursoredActivities.length, hasNextPage]
  );

  const loadMoreItems = useCallback(
    async (startIndex: number, stopIndex: number) => {
      // This function only loads from the bottom of the list, so that
      // cursoredActivities must only be prepended to, so that everything works
      // correctly, even if items are being prepended onto the start of the list
      // (due to new notifications coming in via the listener.)

      if (startIndex !== cursoredActivities.length) {
        throw new Error(
          `loadMoreItems called for non-append load: startIndex ${startIndex}, nCursoredActivities ${cursoredActivities.length}`
        );
      }

      // indexing between startIndex and stopIndex is inclusive of both endpoints.
      // if the startIndex is zero, there is no cursor to use, because it is the
      // first query.

      // stopIndex passed in to this function will never be greater than
      // itemCount. However, we don't know how many items there are left to read,
      // until we actually read them from the database. Therefore, we ensure that
      // the number of items we read here is large enough (rather than just
      // requesting the single next item). Hence the usage of minimumBatchSize.

      const cursor =
        startIndex === 0
          ? undefined
          : cursoredActivities[startIndex - 1].cursor;
      const limit = Math.max(stopIndex - startIndex + 1, minimumBatchSize);
      const result = await getCursoredActivitiesFromFeed(limit, cursor);

      // Append to results
      setCursoredActivities([...cursoredActivities].concat(result));

      const nReadActiviites = result.length;
      if (nReadActiviites === 0) {
        setHasNextPage(false);
      }
    },
    [cursoredActivities, minimumBatchSize]
  );

  return {
    cursoredActivities: cursoredActivities,
    isItemLoaded: isItemLoaded,
    itemCount: itemCount,
    loadMoreItems: loadMoreItems,
  };
};

export type NotificationsListProps = {};

export const NotificationsList = (props: NotificationsListProps) => {
  const classes = useStyles();
  const minimumBatchSize = 10;

  const {
    cursoredActivities,
    isItemLoaded,
    itemCount,
    loadMoreItems,
  } = useNotificationsListState(minimumBatchSize);

  const Foo = (args: { index: number; style: CSSProperties }) => {
    if (!isItemLoaded(args.index)) {
      return (
        <div style={args.style}>
          <CircularProgress />
        </div>
      );
    } else {
      return (
        <div style={args.style}>
          Row {cursoredActivities[args.index].activity} {args.index}
        </div>
      );
    }
  };

  return (
    <div className={classes.container}>
      <AutoSizer>
        {({ height, width }) => {
          return (
            <InfiniteLoader
              isItemLoaded={isItemLoaded}
              itemCount={itemCount}
              loadMoreItems={loadMoreItems}
            >
              {({ onItemsRendered, ref }) => (
                <FixedSizeList
                  ref={ref}
                  itemSize={60}
                  itemCount={itemCount}
                  height={height}
                  width={width}
                  onItemsRendered={onItemsRendered}
                >
                  {Foo}
                </FixedSizeList>
              )}
            </InfiniteLoader>
          );
        }}
      </AutoSizer>
    </div>
  );
};
