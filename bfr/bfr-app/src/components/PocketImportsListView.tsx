import { Card, CardContent, Link, List, Typography } from "@material-ui/core";
import * as log from "loglevel";
import React, { FunctionComponent, useContext, useState } from "react";
import { AuthContext } from "../services/auth/Auth";
import { Database } from "../services/store/Database";
import { getItemSet } from "../services/store/ItemSets";
import { UserId } from "../services/store/Users";

export interface PocketImportItemRecord {
  pocket_item_id: string;
  title?: string | undefined;
  url: string;
  authors?: string[];
  description?: string;
}

type PocketImportItemCardProps = {
  pocketImportItem: PocketImportItemRecord;
};

export const PocketImportItemCard: FunctionComponent<PocketImportItemCardProps> = ({
  pocketImportItem,
}) => {
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
        by {pocketImportItem.authors}
      </Typography>
    );

  const descriptionFragment = pocketImportItem.description && (
    <Typography variant="body2" color="textSecondary">
      {pocketImportItem.description}
    </Typography>
  );

  return (
    <Card variant={"outlined"}>
      <CardContent>
        {titleFragment}
        {authorFragment}
        {descriptionFragment}
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
    console.log(data);
    return {
      pocket_item_id: data.pocket_item_id,
      title: data.metadata?.title,
      url: data.url,
      authors: data.metadata?.authors,
      description: data.metadata?.description,
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

  const [pocketImports, setPocketImports] = useState<PocketImportItemRecord[]>(
    []
  );

  React.useEffect(() => {
    const loadPocketImports = async () => {
      logger.debug(`Getting Pocket imports for uid ${uid}`);

      const loaded: PocketImportItemRecord[] = await getItemSet(
        database,
        PocketImportItemRecordConverter,
        getPocketImportsItemSetPath(uid)
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
  return <List>{pocketImportCards}</List>;
};
