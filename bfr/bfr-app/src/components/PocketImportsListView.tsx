import { List, ListItem, ListItemProps, ListItemText } from "@material-ui/core";
import * as log from "loglevel";
import React, { FunctionComponent, useContext, useState } from "react";
import { AuthContext } from "../services/auth/Auth";
import { Database } from "../services/store/Database";
import { getItemSet } from "../services/store/ItemSets";
import { UserId } from "../services/store/Users";

interface PocketImportItemRecord {
  pocket_item_id: string;
  title: string | undefined;
  url: string;
}

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
    return {
      pocket_item_id: data.pocket_item_id,
      title: data.metadata?.title,
      url: data.url,
    };
  },
};

export type PocketImportsListViewProps = {
  database: Database;
};

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

  const makePocketImportItemCard = (
    pocketImportItem: PocketImportItemRecord
  ) => {
    return (
      <ListItem alignItems="flex-start" key={pocketImportItem.pocket_item_id}>
        <ListItemText primary={pocketImportItem.title} />
      </ListItem>
    );
  };

  const pocketImportCards = pocketImports.map(makePocketImportItemCard);
  return <List>{pocketImportCards}</List>;
};
