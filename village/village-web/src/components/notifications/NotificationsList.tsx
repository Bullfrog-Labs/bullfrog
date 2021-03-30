import {
  CircularProgress,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { useCallback, useEffect, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { Virtuoso } from "react-virtuoso";
import { LogEventFn } from "../../services/Analytics";
import {
  CursoredActivity,
  GetCursoredActivitiesFromFeedFn,
} from "../../services/store/Activities";
import { useGlobalStyles } from "../../styles/styles";
import { ActivityNotificationMatcher } from "./ActivityNotificationMatcher";

const useStyles = makeStyles((theme) => {
  const borderColor = theme.palette.grey[200];
  return {
    container: {
      height: "calc(100vh - 100px)",

      borderWidth: "0px 1px",
      borderLeftColor: borderColor,
      borderRightColor: borderColor,
      borderStyle: "solid solid",
    },
    notificationRow: {
      flexGrow: 1,
      borderBottomWidth: "1px",
      borderBottomColor: borderColor,
      borderBottomStyle: "solid",
      margin: theme.spacing(1),
    },
    footer: {
      display: "block",
      marginLeft: "auto",
      marginRight: "auto",
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      textAlign: "center",
    },
  };
});

type NotificationListFooterProps = {
  hasNextPage: boolean;
};

const NotificationListFooter = (props: NotificationListFooterProps) => {
  const globalClasses = useGlobalStyles();
  const classes = useStyles();
  return (
    <div className={classes.notificationRow}>
      {props.hasNextPage ? (
        <div className={classes.footer}>
          <CircularProgress className={globalClasses.circularProgress} />
        </div>
      ) : (
        <div className={classes.footer}>
          <Typography variant="body1">
            That's it. You've reached the end.
          </Typography>
        </div>
      )}
    </div>
  );
};

type NotificationRowProps = {
  index: number;
  data: CursoredActivity;
  logEvent: LogEventFn;
};

const NotificationRow = (props: NotificationRowProps) => {
  const classes = useStyles();

  return (
    <Grid container direction="column" justify="center" alignItems="stretch">
      <Grid item>
        <div className={classes.notificationRow}>
          <ActivityNotificationMatcher
            activity={props.data.activity}
            logEvent={props.logEvent}
          />
        </div>
      </Grid>
    </Grid>
  );
};

type NotificationListState = {
  cursoredActivities: CursoredActivity[];
  loadMoreItems: (lastItemIndex: number) => Promise<void>;
  hasNextPage: boolean;
};

const useNotificationsListState = (
  minimumBatchSize: number,
  getCursoredActivitiesFromFeed: GetCursoredActivitiesFromFeedFn
): NotificationListState => {
  const [cursoredActivities, setCursoredActivities] = useState<
    CursoredActivity[]
  >([]);
  const [hasNextPage, setHasNextPage] = useState(true);

  const loadMoreItems = useCallback(
    // load from end
    async (lastItemIndex: number) => {
      const cursor =
        lastItemIndex === 0
          ? undefined
          : cursoredActivities[lastItemIndex].cursor;

      const result = await getCursoredActivitiesFromFeed(
        minimumBatchSize,
        cursor
      );

      // Append to results
      setCursoredActivities([...cursoredActivities].concat(result));

      const nReadActivities = result.length;
      if (nReadActivities === 0) {
        setHasNextPage(false);
      }
    },
    [cursoredActivities, getCursoredActivitiesFromFeed, minimumBatchSize]
  );

  return {
    cursoredActivities: cursoredActivities,
    loadMoreItems: loadMoreItems,
    hasNextPage: hasNextPage,
  };
};

export type NotificationsListProps = {
  getCursoredActivitiesFromFeed: GetCursoredActivitiesFromFeedFn;
  logEvent: LogEventFn;
};

export const NotificationsList = (props: NotificationsListProps) => {
  const classes = useStyles();
  const minimumBatchSize = 10;

  const {
    cursoredActivities,
    loadMoreItems,
    hasNextPage,
  } = useNotificationsListState(
    minimumBatchSize,
    props.getCursoredActivitiesFromFeed
  );

  useEffect(() => {
    if (cursoredActivities.length === 0 && hasNextPage) {
      loadMoreItems(0);
    }
  });

  return (
    <div className={classes.container}>
      <AutoSizer>
        {({ height, width }) => {
          return (
            <Virtuoso
              style={{ height: height, width: width }}
              data={cursoredActivities}
              endReached={async (index) => {
                await loadMoreItems(index);
              }}
              overscan={15}
              itemContent={(index, data) => (
                <NotificationRow
                  index={index}
                  data={data}
                  logEvent={props.logEvent}
                />
              )}
              components={{
                Footer: () => (
                  <NotificationListFooter hasNextPage={hasNextPage} />
                ),
              }}
            />
          );
        }}
      </AutoSizer>
    </div>
  );
};
