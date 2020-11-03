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
}) => {};
database: Database;
uid: UserId;
itemListId: ItemListId;

export type ItemListViewProps = {
  itemListRecord: ItemListRecord;
};

export const ItemListView: FunctionComponent<ItemListViewProps> = ({
  database,
  uid,
  itemListId,
}) => {
  const logger = log.getLogger("ItemListView");
  const history = useHistory();

  const [title, setTitle] = useState<string>();
  const [items, setItems] = useState<ItemRecord[]>();

  React.useEffect(() => {
    // Get list contents
    // TODO: support filtering, ordering and paging
    const loadItemList = async () => {
      logger.debug(`Getting item list ${itemListId} for uid ${uid}`);
      const itemList: ItemListRecord | null = await getItemList(
        database,
        uid,
        itemListId
      );

      if (!itemList) {
        logger.debug(
          `Item list ${itemListId} not found for uid ${uid}, redirecting`
        );
        history.replace(ITEM_LIST_404_REDIRECT_URL);
      } else {
        logger.debug(`Done getting item list ${itemListId} for uid ${uid}`);
        setTitle(itemList.title);
        setItems(itemList.items);
      }
    };
  }, [database, uid, itemListId]);

  // Render list contents
  return <div>${title}</div>;
};
