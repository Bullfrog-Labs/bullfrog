import * as log from "loglevel";
import React, { FunctionComponent, useState } from "react";
import { useHistory } from "react-router-dom";
import { Database } from "../services/store/Database";
import {
  ItemListId,
  ItemListRecord,
  getItemList,
  ItemRecord,
} from "../services/store/ItemLists";
import { UserId } from "../services/store/Users";

// Make this less hacky - use an actual 404 page instead of relying on the
// catch-all in Router.tsx
const ITEM_LIST_404_REDIRECT_URL = "/404";

// TODO: Add ability to page through list content

// TODO: Add functionality for translating from list types to the corresponding
//       list query. e.g. "Unread", "Saved", "Favorites", etc. These can probably just
//       be different component types.

export type PocketImportsListViewProps = {
  database: Database;
  uid: UserId;
};
export const PocketImportsListView: FunctionComponent<PocketImportsListViewProps> = ({
  database,
  uid,
}) => {
  const POCKET_IMPORTS_LIST_NAME = "pocket_imports";

  const logger = log.getLogger("PocketImportsListView");

  const [pocketImported, setPocketImported] = useState(false);
  const [items, setItems] = useState<ItemRecord[]>();

  React.useEffect(() => {
    const loadItemList = async () => {
      logger.debug(`Getting Pocket imports item list for uid ${uid}`);
      const itemList: ItemListRecord | null = await getItemList(
        database,
        uid,
        POCKET_IMPORTS_LIST_NAME
      );

      if (!itemList) {
        logger.debug(`Pocket imports item list not found for uid ${uid}`);
      } else {
        logger.debug(`Done getting Pocket imports item list for uid ${uid}`);
        setPocketImported(true);
        setItems(itemList.items);
      }
    };

    loadItemList();
  }, [database, uid, pocketImported]);

  if (!pocketImported) {
    return <div>Import from pocket</div>;
  } else {
    return (
      <ItemListView
        itemListRecord={{ id: "id", title: "Pocket Imports", items: items! }}
      />
    );
  }
};

export type ItemListViewProps = {
  itemListRecord: ItemListRecord;
};

// TODO: Make this generic

export const ItemListView: FunctionComponent<ItemListViewProps> = ({
  itemListRecord,
}) => {
  const logger = log.getLogger("ItemListView");

  // Render list contents
  return (
    <div>
      Title: ${itemListRecord.title}, num items: ${itemListRecord.items.length}
    </div>
  );
};
