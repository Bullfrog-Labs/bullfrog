import { CircularProgress, makeStyles } from "@material-ui/core";
import React, {
  CSSProperties,
  Dispatch,
  SetStateAction,
  useState,
} from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import { Activity } from "../../services/activities/Types";
import {
  CursoredActivity,
  getCursoredActivitiesFromFeed,
} from "../../services/store/Activities";
import { ActivityNotification } from "./ActivityNotification";

const useStyles = makeStyles((theme) => ({
  container: {
    height: "100vh",
  },
}));
const DEFAULT_NOTIFICATION_ITEM_COUNT = 1000;

let cursoredActivities: CursoredActivity[] = [];

// How does it work if there are items added to the front of the list?

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

const loadCursoredActivities = (
  cursoredActivities: CursoredActivity[],
  setCursoredActivities: Dispatch<SetStateAction<CursoredActivity[]>>
) => async (
  startIndex: number,
  stopIndex: number
): Promise<{ nReadActiviites: number }> => {
  // This function only loads from the bottom of the list, so that
  // cursoredActivities must only be prepended to, so that everything works
  // correctly, even if items are being prepended onto the start of the list
  // (due to new notifications coming in via the listener.)

  console.log(startIndex, stopIndex);
  console.log(cursoredActivities);

  if (startIndex !== cursoredActivities.length) {
    console.log(cursoredActivities);
    throw new Error(
      `loadCursoredActivities called for non-append load: startIndex ${startIndex}, nCursoredActivities ${cursoredActivities.length}`
    );
  }

  // indexing between startIndex and stopIndex is inclusive of both endpoints.
  // if the startIndex is zero, there is no cursor to use, because it is the
  // first query.
  const cursor =
    startIndex === 0 ? undefined : cursoredActivities[startIndex - 1].cursor;
  const limit = stopIndex - startIndex + 1;
  const result = await getCursoredActivitiesFromFeed(limit, cursor);

  // Append to results
  setCursoredActivities([...cursoredActivities].concat(result));

  return { nReadActiviites: result.length };
};

// 1. Initially, renders the first 15 items (threshold), without any call to
// loadMoreItems.
// 2. Then calls isItemLoaded for 0-28.
// 3. Then does loadMoreItems for 0-28.
// 4. Then renders 0-28.
// 5. Why does it then start to render 35-49??!

export type NotificationsListProps = {};

export const NotificationsList = (props: NotificationsListProps) => {
  const classes = useStyles();
  const minimumBatchSize = 10;

  // This state is not in example wrapper iteslf, but it is here- red herring?
  const [cursoredActivities, setCursoredActivities] = useState<
    CursoredActivity[]
  >([]);

  const [hasNextPage, setHasNextPage] = useState(true);

  const itemCount = hasNextPage
    ? cursoredActivities.length + 1
    : cursoredActivities.length;

  const isItemLoaded = (index: number): boolean => {
    if (!hasNextPage) {
      return true;
    }
    return index < cursoredActivities.length;
  };

  const loadMoreItems = async (startIndex: number, stopIndex: number) => {
    const loadInner = loadCursoredActivities(
      cursoredActivities,
      setCursoredActivities
    );

    // stopIndex passed in to this function will never be greater than
    // itemCount. However, we don't know how many items there are left to read,
    // until we actually read them from the database. Therefore, we ensure that
    // the number of items we read here is large enough (rather than just
    // requesting the single next item).
    const stopIndexInner = Math.max(
      stopIndex,
      startIndex + minimumBatchSize - 1
    );

    const { nReadActiviites } = await loadInner(startIndex, stopIndexInner);

    if (nReadActiviites === 0) {
      setHasNextPage(false);
    }
  };

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

  // useEffect(() => {}, []);

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
