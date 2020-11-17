import {
  Card,
  CardContent,
  Link,
  makeStyles,
  Typography,
  Grid,
  IconButton,
  Chip,
} from "@material-ui/core";
import { ItemStatus, PocketImportItemRecord } from "../services/store/ItemSets";
import { DateTime, Duration } from "luxon";
import LibraryAddCheckIcon from "@material-ui/icons/LibraryAddCheck";
import React, { FunctionComponent } from "react";
import { SnoozeSelectButton } from "./SnoozeSelectButton";

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
  itemToolbarButtonDisabled: {
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
  stateChip: {
    margin: theme.spacing(1),
  },
}));

export type PocketImportItemCardProps = {
  pocketImportItem: PocketImportItemRecord;
  hideSnoozeControl: boolean;
  onArchiveToggleItem?: (pocketImportItem: PocketImportItemRecord) => void;
  onSnoozeItem?: (
    pocketImportItem: PocketImportItemRecord,
    snoozeDuration: Duration
  ) => void;
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
  hideSnoozeControl = false,
  onArchiveToggleItem = (pocketImportItem: PocketImportItemRecord) => {},
  onSnoozeItem = (
    pocketImportItem: PocketImportItemRecord,
    snoozeDuration: Duration
  ) => {},
}) => {
  const classes = useStyles();

  const cardTitle = pocketImportItem.title
    ? pocketImportItem.title
    : pocketImportItem.url;

  const SnoozedChip = () => {
    const snoozeEndTime = pocketImportItem.snoozeEndTime;
    if (
      snoozeEndTime &&
      DateTime.fromJSDate(snoozeEndTime) > DateTime.local()
    ) {
      return (
        <Chip
          className={classes.stateChip}
          label={`Snoozed until ${formatTime(snoozeEndTime)}`}
          size="small"
        />
      );
    } else {
      return <React.Fragment />;
    }
  };

  const titleFragment = (
    <Typography variant="h6" color="textPrimary">
      <Link href={pocketImportItem.url}>{cardTitle}</Link>
      <SnoozedChip />
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
    onArchiveToggleItem(pocketImportItem);
  };

  const handleSnoozeClick = (snoozeDuration: Duration) => {
    onSnoozeItem(pocketImportItem, snoozeDuration);
  };

  const SnoozeSelectButtonRow = () => {
    if (!hideSnoozeControl) {
      return (
        <Grid item xs={12}>
          <SnoozeSelectButton
            onSnoozeItem={handleSnoozeClick}
            id={`snooze-button-${pocketImportItem.pocket_item_id}`}
          />
        </Grid>
      );
    } else {
      return <React.Fragment />;
    }
  };

  const ArchiveButton = () => {
    const className =
      pocketImportItem.status === ItemStatus.Archived
        ? classes.itemToolbarButtonDisabled
        : classes.itemToolbarButton;
    const color =
      pocketImportItem.status === ItemStatus.Archived ? "disabled" : undefined;
    return (
      <IconButton
        className={className}
        onClick={handleArchiveClick}
        data-testid={`archive-button-${pocketImportItem.pocket_item_id}`}
      >
        <LibraryAddCheckIcon fontSize="small" color={color} />
      </IconButton>
    );
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
                <ArchiveButton />
              </Grid>
              <Grid item xs={12}>
                <SnoozeSelectButtonRow />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
