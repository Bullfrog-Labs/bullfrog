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
import { DateTime } from "luxon";
import LibraryAddCheckIcon from "@material-ui/icons/LibraryAddCheck";
import SnoozeIcon from "@material-ui/icons/Snooze";
import * as log from "loglevel";
import React, { FunctionComponent, useContext, useState } from "react";
import { AuthContext } from "../services/auth/Auth";
import { Database } from "../services/store/Database";
import { getItemSet } from "../services/store/ItemSets";
import { UserId } from "../services/store/Users";

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
  timesLine: {
    marginTop: theme.spacing(1),
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
    <em>{" - " + pocketImportItem.estReadTimeMinutes} mins</em>
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
    <Card className={classes.pocketImportItemCard} variant={"outlined"}>
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
  database: Database;
};

// TODO: Switch to a generic and clearly-demarcated collection path for Pocket imports
/*
const getPocketImportsItemSetPath = (uid: UserId) =>
  `users/${uid}/item_sets/pocket_imports/items`;
  */
const getPocketImportsItemSetPath = (uid: UserId) => `users/${uid}/bookmarks`;

export const PocketImportsListView: FunctionComponent<PocketImportsListViewProps> = ({
  database,
}) => {
  const logger = log.getLogger("PocketImportsListView");
  const authState = useContext(AuthContext) as firebase.User;
  const uid = authState.uid;
  const classes = useStyles();

  const [pocketImports, setPocketImports] = useState<PocketImportItemRecord[]>(
    []
  );

  React.useEffect(() => {
    const loadPocketImports = async () => {
      logger.debug(`Getting Pocket imports for uid ${uid}`);

      const loaded: PocketImportItemRecord[] = await getItemSet(
        database,
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
  }, [database, uid, logger]);

  const pocketImportCards = pocketImports.map((x) => (
    <PocketImportItemCard pocketImportItem={x} />
  ));
  return (
    <React.Fragment>
      <Typography variant="h3" className={classes.pageTitle}>
        Inbox
      </Typography>
      <List>{pocketImportCards}</List>
    </React.Fragment>
  );
};
