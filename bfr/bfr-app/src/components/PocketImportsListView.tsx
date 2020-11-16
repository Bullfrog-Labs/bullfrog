import {
  Card,
  CardContent,
  Link,
  List,
  makeStyles,
  Typography,
  Grid,
  IconButton,
  MenuItem,
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import { DateTime, Interval, Duration } from "luxon";
import LibraryAddCheckIcon from "@material-ui/icons/LibraryAddCheck";
import SnoozeIcon from "@material-ui/icons/Snooze";
import * as log from "loglevel";
import React, { FunctionComponent, useContext, useState } from "react";
import { AuthContext } from "../services/auth/Auth";
import { UserId } from "../services/store/Users";
import { GetItemSetFn } from "../services/store/ItemSets";

const useStyles = makeStyles((theme) => ({
  pocketImportItemCard: {
    margin: theme.spacing(1),
  },
  pageTitle: {
    margin: theme.spacing(1),
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

export interface PocketImportItemRecord {
  pocket_item_id: string;
  title?: string | undefined;
  url: string;
  authors?: string[];
  description?: string;
  text?: string;
  saveTime?: Date;
  estReadTimeMinutes?: number;
}

export type PocketImportItemCardProps = {
  pocketImportItem: PocketImportItemRecord;
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
                <IconButton className={classes.itemToolbarButton}>
                  <LibraryAddCheckIcon fontSize="small" />
                </IconButton>
              </Grid>
              <Grid item xs={12}>
                <IconButton className={classes.itemToolbarButton}>
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
    };
  },
};

export type PocketImportsListViewProps = {
  getItemSet: GetItemSetFn<PocketImportItemRecord>;
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

type MenuSelectItem = {
  id: string;
  value: string;
  buttonValue: string;
};

export const MenuSelect = (props: {
  items: readonly MenuSelectItem[];
  defaultValue: string;
  onItemSelect: (item: MenuSelectItem) => void;
}) => {
  const classes = useStyles();
  const { items, defaultValue, onItemSelect } = props;
  const itemValues = Object.fromEntries(items.map((item) => [item.id, item]));

  const [intervalMenuLabel, setIntervalMenuLabel] = React.useState<string>(
    defaultValue
  );

  const [anchorEl, setAnchorEl] = React.useState<
    (EventTarget & HTMLButtonElement) | undefined
  >();

  const handleButtonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>
  ) => {
    setIntervalMenuLabel(itemValues[event.currentTarget.id].buttonValue);
    onItemSelect(itemValues[event.currentTarget.id]);
    setAnchorEl(undefined);
  };

  const handleClose = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setAnchorEl(undefined);
  };

  const menuItems = items.map((item) => {
    return (
      <MenuItem id={item.id} onClick={handleMenuItemClick}>
        {item.value}
      </MenuItem>
    );
  });

  return (
    <React.Fragment>
      <Button
        aria-haspopup="true"
        onClick={handleButtonClick}
        className={classes.listToolbarButton}
      >
        {intervalMenuLabel}
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {menuItems}
      </Menu>
    </React.Fragment>
  );
};

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

// TODO: Switch to a generic and clearly-demarcated collection path for Pocket imports
/*
const getPocketImportsItemSetPath = (uid: UserId) =>
  `users/${uid}/item_sets/pocket_imports/items`;
  */
const getPocketImportsItemSetPath = (uid: UserId) => `users/${uid}/bookmarks`;

export const PocketImportsListView: FunctionComponent<PocketImportsListViewProps> = ({
  getItemSet,
}) => {
  const logger = log.getLogger("PocketImportsListView");
  const authState = useContext(AuthContext) as firebase.User;
  const uid = authState.uid;
  const classes = useStyles();

  const [pocketImports, setPocketImports] = useState<PocketImportItemRecord[]>(
    []
  );

  const [intervalFilter, setIntervalFilter] = useState<Interval>();

  logger.debug(`filter ${intervalFilter?.toString()}`);

  const filteredPocketImports = pocketImports.filter((item) => {
    if (!intervalFilter) {
      return true;
    }
    if (!item.saveTime) {
      return false;
    }
    const saveTime = DateTime.fromJSDate(item.saveTime);
    return intervalFilter?.contains(saveTime);
  });

  React.useEffect(() => {
    const loadPocketImports = async () => {
      logger.debug(`Getting Pocket imports for uid ${uid}`);

      const loaded: PocketImportItemRecord[] = await getItemSet(
        PocketImportItemRecordConverter,
        getPocketImportsItemSetPath(uid),
        ["pocket_created_at", "desc"]
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
    logger.debug("Selected group entry");
  };

  const pocketImportCards = filteredPocketImports.map((x) => (
    <PocketImportItemCard pocketImportItem={x} />
  ));
  return (
    <React.Fragment>
      <Typography variant="h3" className={classes.pageTitle}>
        Inbox
      </Typography>
      <InboxToolsHeader
        onIntervalItemSelect={onIntervalItemSelect}
        onGroupItemSelect={onGroupItemSelect}
      />
      <List>{pocketImportCards}</List>
    </React.Fragment>
  );
};
