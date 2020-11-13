import {
  Card,
  CardContent,
  Link,
  List,
  makeStyles,
  Typography,
  Grid,
  IconButton,
} from "@material-ui/core";
import { DateTime, Interval, Duration } from "luxon";
import LibraryAddCheckIcon from "@material-ui/icons/LibraryAddCheck";
import SnoozeIcon from "@material-ui/icons/Snooze";
import * as log from "loglevel";
import React, { FunctionComponent, useContext, useState } from "react";
import { AuthContext } from "../services/auth/Auth";
import { UserId } from "../services/store/Users";
import { GetItemSetFn, UpdateItemFn } from "../services/store/ItemSets";
import * as R from "ramda";
import { MenuSelect, MenuSelectItem } from "./MenuSelect";
import { getContentType, ContentType } from "./util/ContentType";

const useStyles = makeStyles((theme) => ({
  pocketImportItemCard: {
    margin: theme.spacing(1),
  },
  pageTitle: {
    margin: theme.spacing(1),
  },
  sectionTitle: {
    margin: "10px",
  },
  itemToolbarButton: {
    padding: "6px",
    float: "right",
  },
  timesLine: {
    marginTop: theme.spacing(1),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export interface PocketImportItemRecord {
  pocket_item_id: string;
  title?: string | undefined;
  url: string;
  authors?: string[];
  description?: string;
  text?: string;
  saveTime?: Date;
  estReadTimeMinutes?: number;
  contentType?: ContentType;
}

export type PocketImportItemCardProps = {
  pocketImportItem: PocketImportItemRecord;
  onArchiveItem?: (pocketImportItem: PocketImportItemRecord) => void;
  onSnoozeItem?: (pocketImportItem: PocketImportItemRecord) => void;
};

const extractDescription = (
  pocketImportItem: PocketImportItemRecord
): string => {
  if (pocketImportItem.description) {
    return pocketImportItem.description;
  } else if (pocketImportItem.text) {
    return pocketImportItem.text.substring(0, 280) + "...";
  } else {
    return "";
  }
};

const formatTime = (date: Date) => {
  const dt = DateTime.fromJSDate(date);
  return dt.toLocaleString(DateTime.DATETIME_MED);
};

export const PocketImportItemCard: FunctionComponent<PocketImportItemCardProps> = ({
  pocketImportItem,
  onArchiveItem = (pocketImportItem: PocketImportItemRecord) => {},
  onSnoozeItem = (pocketImportItem: PocketImportItemRecord) => {},
}) => {
  const classes = useStyles();

  const cardTitle = pocketImportItem.title
    ? pocketImportItem.title
    : pocketImportItem.url;

  const titleFragment = (
    <Typography variant="h6" color="textPrimary">
      <Link href={pocketImportItem.url}>{cardTitle}</Link>
    </Typography>
  );

  const authorFragment = pocketImportItem.authors &&
    pocketImportItem.authors.length > 0 && (
      <Typography variant="body1" color="textPrimary">
        by {pocketImportItem.authors.join(", ")}
      </Typography>
    );

  const descriptionFragment = (
    <Typography variant="body2" color="textSecondary">
      {extractDescription(pocketImportItem)}
    </Typography>
  );

  const estReadTimeFragment = pocketImportItem.estReadTimeMinutes && (
    <em>{" - " + pocketImportItem.estReadTimeMinutes + " mins"}</em>
  );

  const timesFragment = pocketImportItem.saveTime && (
    <Typography
      variant="body2"
      color="textSecondary"
      className={classes.timesLine}
    >
      {formatTime(pocketImportItem.saveTime)} {estReadTimeFragment}
    </Typography>
  );

  const handleArchiveClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    onArchiveItem(pocketImportItem);
  };

  const handleSnoozeClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    onSnoozeItem(pocketImportItem);
  };

  return (
    <Card
      className={classes.pocketImportItemCard}
      variant={"outlined"}
      key={pocketImportItem.pocket_item_id}
    >
      <CardContent>
        <Grid container>
          <Grid item xs={11}>
            {titleFragment}
            {authorFragment}
            {descriptionFragment}
            {timesFragment}
          </Grid>
          <Grid item xs={1}>
            <Grid container>
              <Grid item xs={12}>
                <IconButton
                  className={classes.itemToolbarButton}
                  onClick={handleArchiveClick}
                >
                  <LibraryAddCheckIcon fontSize="small" />
                </IconButton>
              </Grid>
              <Grid item xs={12}>
                <IconButton
                  className={classes.itemToolbarButton}
                  onClick={handleSnoozeClick}
                >
                  <SnoozeIcon fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const PocketImportItemRecordConverter = {
  toFirestore: (
    pocketItem: PocketImportItemRecord
  ): firebase.firestore.DocumentData => {
    // should not be used, since only reads are supported now
    throw Error(
      "PocketImportItemRecordConverter::toFirestore should not be used"
    );
  },

  fromFirestore: (
    snapshot: firebase.firestore.QueryDocumentSnapshot,
    options: firebase.firestore.SnapshotOptions
  ): PocketImportItemRecord => {
    const data = snapshot.data(options);
    const pocketJSON = JSON.parse(data.pocket_json);
    return {
      pocket_item_id: data.pocket_item_id,
      title: data.metadata?.title,
      url: data.url,
      authors: data.metadata?.authors,
      description: data.metadata?.description || pocketJSON.excerpt,
      text: data.metadata?.text,
      saveTime: data.pocket_created_at?.toDate(),
      estReadTimeMinutes: pocketJSON.time_to_read,
      contentType: getContentType(data),
    };
  },
};

export type PocketImportsListViewProps = {
  getItemSet: GetItemSetFn<PocketImportItemRecord>;
  updateItem: UpdateItemFn<PocketImportItemRecord>;
};

export const InboxToolsHeader = (props: {
  onIntervalItemSelect: (item: MenuSelectItem) => void;
  onGroupItemSelect: (item: MenuSelectItem) => void;
}) => {
  return (
    <React.Fragment>
      <IntervalFilterTool onItemSelect={props.onIntervalItemSelect} />
      <GroupTool onItemSelect={props.onGroupItemSelect} />
    </React.Fragment>
  );
};

/**
 * Interval menu select button.
 */

const INTERVAL_SELECT_MENU_ITEMS = [
  { id: "filter-time-none", value: "None", buttonValue: "Interval" },
  { id: "filter-time-1day", value: "Past Day", buttonValue: "Past Day" },
  { id: "filter-time-1week", value: "Past Week", buttonValue: "Past Week" },
];

const intervalSelectIDs = INTERVAL_SELECT_MENU_ITEMS.map((item) => item.id);
type IntervalSelectIDType = typeof intervalSelectIDs[number];

export const IntervalFilterTool = (props: {
  onItemSelect: (item: MenuSelectItem) => void;
}) => {
  return (
    <MenuSelect
      items={INTERVAL_SELECT_MENU_ITEMS}
      defaultValue="Interval"
      onItemSelect={props.onItemSelect}
    />
  );
};

/**
 * Group menu select button.
 */

const GROUP_SELECT_MENU_ITEMS = [
  { id: "group-none", value: "None", buttonValue: "Group" },
  {
    id: "group-content-type",
    value: "Content Type",
    buttonValue: "Content Type",
  },
] as const;

const groupSelectIDs = GROUP_SELECT_MENU_ITEMS.map((item) => item.id);
type GroupSelectIDType = typeof groupSelectIDs[number];

export const GroupTool = (props: {
  onItemSelect: (item: MenuSelectItem) => void;
}) => {
  return (
    <MenuSelect
      items={GROUP_SELECT_MENU_ITEMS}
      defaultValue="Group"
      onItemSelect={props.onItemSelect}
    />
  );
};

/**
 * Filter and grouping functions.
 */

const itemListFilterFn = (intervalFilter: Interval | undefined) => (
  item: PocketImportItemRecord
) => {
  if (!intervalFilter) {
    return true;
  }
  if (!item.saveTime) {
    return false;
  }
  const saveTime = DateTime.fromJSDate(item.saveTime);
  return intervalFilter?.contains(saveTime);
};

const groupByFn = (groupBy: GroupSelectIDType) => (
  item: PocketImportItemRecord
): string => {
  function getGroupProp(groupBy: GroupSelectIDType | undefined) {
    switch (groupBy) {
      case "group-content-type":
        return "contentType";
      default:
        return undefined;
    }
  }
  const groupProp = getGroupProp(groupBy);

  // Dumb ts issue here - it doesnt detect that item[groupProp] must be string.
  if (groupProp && item[groupProp] !== undefined) {
    return item[groupProp] as string;
  } else {
    return "Other";
  }
};

// TODO: Switch to a generic and clearly-demarcated collection path for Pocket imports
/*
const getPocketImportsItemSetPath = (uid: UserId) =>
  `users/${uid}/item_sets/pocket_imports/items`;
  */
const getPocketImportsItemSetPath = (uid: UserId) => `users/${uid}/bookmarks`;

export const PocketImportsListView: FunctionComponent<PocketImportsListViewProps> = ({
  getItemSet,
  updateItem,
}) => {
  const logger = log.getLogger("PocketImportsListView");
  const authState = useContext(AuthContext) as firebase.User;
  const uid = authState.uid;
  const classes = useStyles();

  const [pocketImports, setPocketImports] = useState<PocketImportItemRecord[]>(
    []
  );

  const [intervalFilter, setIntervalFilter] = useState<Interval>();
  const [groupBy, setGroupBy] = useState<GroupSelectIDType>();

  logger.debug(`Filtering; interval=${intervalFilter?.toString()}`);
  const filteredPocketImports = pocketImports.filter(
    itemListFilterFn(intervalFilter)
  );

  React.useEffect(() => {
    const loadPocketImports = async () => {
      logger.debug(`Getting Pocket imports for uid ${uid}`);

      const loaded: PocketImportItemRecord[] = await getItemSet(
        PocketImportItemRecordConverter,
        getPocketImportsItemSetPath(uid),
        [["pocket_created_at", "desc"]],
        ["archived", "!=", false]
      );

      logger.debug(
        `Done getting ${loaded.length} Pocket imports for uid ${uid}`
      );

      setPocketImports(loaded);
    };

    loadPocketImports();
  }, [getItemSet, uid, logger]);

  const onIntervalItemSelect = (item: MenuSelectItem) => {
    logger.debug("Selected interval entry " + item.value);
    function getDuration(item: MenuSelectItem): Duration | undefined {
      switch (item.id as IntervalSelectIDType) {
        case "filter-time-none":
          return undefined;
        case "filter-time-1day":
          return Duration.fromObject({ days: 1 });
        case "filter-time-1week":
          return Duration.fromObject({ weeks: 1 });
      }
    }
    const duration = getDuration(item);
    if (duration) {
      const interval = Interval.before(DateTime.local(), duration);
      setIntervalFilter(interval);
    } else {
      setIntervalFilter(undefined);
    }
  };

  const onGroupItemSelect = (item: MenuSelectItem) => {
    logger.debug("Selected group entry " + item.id);
    if (item.id && item.id !== "group-none") {
      setGroupBy(item.id as GroupSelectIDType);
    } else {
      setGroupBy(undefined);
    }
  };

  const onArchiveItem = async (pocketImportItem: PocketImportItemRecord) => {
    logger.debug("archive item request " + pocketImportItem.pocket_item_id);
    const updatedItem = Object.assign({}, pocketImportItem, { archived: true });
    const filteredPocketImports = pocketImports.filter(
      (item) => item.pocket_item_id !== pocketImportItem.pocket_item_id
    );
    const updatedPocketImports = [...filteredPocketImports, updatedItem];
    setPocketImports(updatedPocketImports);
    logger.debug("set new items");
    await updateItem(
      PocketImportItemRecordConverter,
      getPocketImportsItemSetPath(uid),
      pocketImportItem.pocket_item_id,
      updatedItem
    );
    logger.debug("finished archive item " + pocketImportItem.pocket_item_id);
  };
  const onSnoozeItem = (pocketImportItem: PocketImportItemRecord) => {};

  function GroupedList(props: {
    items: PocketImportItemRecord[];
    groupBy: (item: PocketImportItemRecord) => string;
    onArchiveItem: (pocketImportItem: PocketImportItemRecord) => void;
    onSnoozeItem: (pocketImportItem: PocketImportItemRecord) => void;
  }) {
    const { items, groupBy } = props;
    const grouped = R.groupBy(groupBy, items);
    const els = Object.keys(grouped).map((group) => {
      return (
        <React.Fragment>
          <Typography variant="h6" className={classes.sectionTitle}>
            {group}
          </Typography>
          <FlatList
            items={grouped[group]}
            onArchiveItem={onArchiveItem}
            onSnoozeItem={onSnoozeItem}
          />
        </React.Fragment>
      );
    });
    return <React.Fragment>{els}</React.Fragment>;
  }

  function FlatList(props: {
    items: PocketImportItemRecord[];
    onArchiveItem: (pocketImportItem: PocketImportItemRecord) => void;
    onSnoozeItem: (pocketImportItem: PocketImportItemRecord) => void;
  }) {
    const pocketImportCards = props.items.map((x) => (
      <PocketImportItemCard
        pocketImportItem={x}
        onArchiveItem={onArchiveItem}
        onSnoozeItem={onSnoozeItem}
      />
    ));
    return <List>{pocketImportCards}</List>;
  }

  function ItemList(props: {
    items: PocketImportItemRecord[];
    groupBy: GroupSelectIDType | undefined;
    onArchiveItem: (pocketImportItem: PocketImportItemRecord) => void;
    onSnoozeItem: (pocketImportItem: PocketImportItemRecord) => void;
  }) {
    const { items, groupBy } = props;
    if (groupBy) {
      return (
        <GroupedList
          items={items}
          groupBy={groupByFn(groupBy)}
          onArchiveItem={onArchiveItem}
          onSnoozeItem={onSnoozeItem}
        />
      );
    } else {
      return (
        <FlatList
          items={items}
          onArchiveItem={onArchiveItem}
          onSnoozeItem={onSnoozeItem}
        />
      );
    }
  }

  return (
    <React.Fragment>
      <Typography variant="h3" className={classes.pageTitle}>
        Inbox
      </Typography>
      <InboxToolsHeader
        onIntervalItemSelect={onIntervalItemSelect}
        onGroupItemSelect={onGroupItemSelect}
      />
      <ItemList
        items={filteredPocketImports}
        groupBy={groupBy}
        onArchiveItem={onArchiveItem}
        onSnoozeItem={onSnoozeItem}
      />
    </React.Fragment>
  );
};
