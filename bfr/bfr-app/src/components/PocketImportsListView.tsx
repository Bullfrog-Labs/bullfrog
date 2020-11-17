import { List, makeStyles, Typography } from "@material-ui/core";
import { DateTime, Interval, Duration } from "luxon";
import * as log from "loglevel";
import React, { FunctionComponent, useContext, useState } from "react";
import { AuthContext } from "../services/auth/Auth";
import { UserId } from "../services/store/Users";
import {
  GetItemSetFn,
  UpdateItemFn,
  PocketImportItemRecord,
  ItemStatus,
  PocketImportItemRecordConverter,
} from "../services/store/ItemSets";
import { PocketImportItemCard } from "./PocketImportItemCard";
import * as R from "ramda";
import { MenuSelect, MenuSelectItem } from "./MenuSelect";

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
  listToolbarButton: {
    margin: "4px",
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

const EMPTY_DURATION = Duration.fromObject({ minutes: 0 });

export type PocketImportsListViewProps = {
  getItemSet: GetItemSetFn<PocketImportItemRecord>;
  updateItem: UpdateItemFn<PocketImportItemRecord>;
  title: string;
  statusFilter?: ItemStatus[];
  showSnoozed?: boolean;
  hideSnoozeControl?: boolean;
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

const itemListFilterFn = (
  intervalFilter: Interval | undefined,
  status: ItemStatus[],
  showSnoozed: boolean
) => (item: PocketImportItemRecord) => {
  const logger = log.getLogger("itemListFilterFn");
  // Interval
  let intervalInclude = true;
  if (item.saveTime && intervalFilter) {
    const saveTime = DateTime.fromJSDate(item.saveTime);
    intervalInclude = intervalFilter?.contains(saveTime);
  }

  // Snooze time
  let snoozeTimeInclude = true;
  if (!showSnoozed && item.snoozeEndTime) {
    const currentTime = DateTime.local();
    snoozeTimeInclude = DateTime.fromJSDate(item.snoozeEndTime) <= currentTime;
  }

  // Status
  const statusInclude = !item.status || status.indexOf(item.status) > -1;

  // Combine
  logger.trace(
    `Filter: intervalInclude=${intervalInclude}, statusInclude=${statusInclude},` +
      ` snoozeTimeInclude=${snoozeTimeInclude}`
  );
  return intervalInclude && statusInclude && snoozeTimeInclude;
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
  title,
  statusFilter = [ItemStatus.Unread],
  showSnoozed = false,
  hideSnoozeControl = false,
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

  const filteredPocketImports = pocketImports.filter(
    itemListFilterFn(intervalFilter, statusFilter, showSnoozed)
  );

  React.useEffect(() => {
    const loadPocketImports = async () => {
      logger.debug(`Getting Pocket imports for uid ${uid}`);

      const loaded: PocketImportItemRecord[] = await getItemSet(
        PocketImportItemRecordConverter,
        getPocketImportsItemSetPath(uid),
        [["pocket_created_at", "desc"]]
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

  const onArchiveToggleItem = async (
    pocketImportItem: PocketImportItemRecord
  ) => {
    logger.debug(
      "archive toggle item request " + pocketImportItem.pocket_item_id
    );

    const itemToUpdate = pocketImports.find((item) => {
      return item.pocket_item_id === pocketImportItem.pocket_item_id;
    });

    if (!itemToUpdate) {
      logger.error("missing item, ignoring");
      return;
    }

    const updatedStatus =
      pocketImportItem.status === ItemStatus.Archived
        ? ItemStatus.Unread
        : ItemStatus.Archived;

    logger.debug(
      `item was ${
        ItemStatus[pocketImportItem.status || ItemStatus.Unread]
      }, toggling to ${ItemStatus[updatedStatus]}`
    );

    itemToUpdate.status = updatedStatus;

    const updatedPocketImports = Array.from(pocketImports);
    setPocketImports(updatedPocketImports);

    logger.debug(`set ${updatedPocketImports.length} items`);
    await updateItem(
      PocketImportItemRecordConverter,
      getPocketImportsItemSetPath(uid),
      itemToUpdate.pocket_item_id,
      itemToUpdate
    );

    logger.debug(
      `finished marking item ${pocketImportItem.pocket_item_id} ${ItemStatus[updatedStatus]}`
    );
  };

  const onSnoozeItem = async (
    pocketImportItem: PocketImportItemRecord,
    snoozeDuration: Duration
  ) => {
    logger.debug("snooze item request " + pocketImportItem.pocket_item_id);
    if (snoozeDuration.equals(EMPTY_DURATION)) {
      logger.debug("empty snooze duration, ignoring");
      return;
    }
    const updatedItem = Object.assign({}, pocketImportItem);
    logger.debug("snoozing for " + snoozeDuration);
    updatedItem.snoozeEndTime = DateTime.local()
      .plus(snoozeDuration)
      .toJSDate();
    const filteredPocketImports = pocketImports.filter(
      (item) => item.pocket_item_id !== pocketImportItem.pocket_item_id
    );
    const updatedPocketImports = [...filteredPocketImports, updatedItem];
    setPocketImports(updatedPocketImports);
    logger.debug(`set ${updatedPocketImports.length} items`);
    await updateItem(
      PocketImportItemRecordConverter,
      getPocketImportsItemSetPath(uid),
      pocketImportItem.pocket_item_id,
      updatedItem
    );
    logger.debug("finished snooze item " + pocketImportItem.pocket_item_id);
  };

  function GroupedList(props: {
    items: PocketImportItemRecord[];
    groupBy: (item: PocketImportItemRecord) => string;
    onArchiveToggleItem: (pocketImportItem: PocketImportItemRecord) => void;
    onSnoozeItem: (
      pocketImportItem: PocketImportItemRecord,
      snoozeDuration: Duration
    ) => void;
  }) {
    const { items, groupBy } = props;
    const grouped = R.groupBy(groupBy, items);
    const els = Object.keys(grouped).map((group) => {
      return (
        <React.Fragment key={group}>
          <Typography variant="h6" className={classes.sectionTitle}>
            {group}
          </Typography>
          <FlatList
            items={grouped[group]}
            onArchiveToggleItem={onArchiveToggleItem}
            onSnoozeItem={onSnoozeItem}
          />
        </React.Fragment>
      );
    });
    return <React.Fragment>{els}</React.Fragment>;
  }

  function FlatList(props: {
    items: PocketImportItemRecord[];
    onArchiveToggleItem: (pocketImportItem: PocketImportItemRecord) => void;
    onSnoozeItem: (
      pocketImportItem: PocketImportItemRecord,
      snoozeDuration: Duration
    ) => void;
  }) {
    const pocketImportCards = props.items.map((x) => (
      <PocketImportItemCard
        pocketImportItem={x}
        key={x.pocket_item_id}
        onArchiveToggleItem={onArchiveToggleItem}
        onSnoozeItem={onSnoozeItem}
        hideSnoozeControl={hideSnoozeControl}
      />
    ));
    return <List>{pocketImportCards}</List>;
  }

  function ItemList(props: {
    items: PocketImportItemRecord[];
    groupBy: GroupSelectIDType | undefined;
    onArchiveToggleItem: (pocketImportItem: PocketImportItemRecord) => void;
    onSnoozeItem: (
      pocketImportItem: PocketImportItemRecord,
      snoozeDuration: Duration
    ) => void;
  }) {
    const { items, groupBy } = props;
    if (groupBy) {
      return (
        <GroupedList
          items={items}
          groupBy={groupByFn(groupBy)}
          onArchiveToggleItem={onArchiveToggleItem}
          onSnoozeItem={onSnoozeItem}
        />
      );
    } else {
      return (
        <FlatList
          items={items}
          onArchiveToggleItem={onArchiveToggleItem}
          onSnoozeItem={onSnoozeItem}
        />
      );
    }
  }

  return (
    <React.Fragment>
      <Typography variant="h3" className={classes.pageTitle}>
        {title}
      </Typography>
      <InboxToolsHeader
        onIntervalItemSelect={onIntervalItemSelect}
        onGroupItemSelect={onGroupItemSelect}
      />
      <ItemList
        items={filteredPocketImports}
        groupBy={groupBy}
        onArchiveToggleItem={onArchiveToggleItem}
        onSnoozeItem={onSnoozeItem}
      />
    </React.Fragment>
  );
};
