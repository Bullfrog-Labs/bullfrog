import * as log from "loglevel";
import { Database } from "./Database";
import { getUser, UserId, USERS_COLLECTION } from "./Users";

export type ItemType = "article";

export interface ItemRecord {
  id: string;
  type: ItemType;

  title: string;
  url: string;
}

const ITEM_RECORD_CONVERTER = {
  toFirestore: (ir: ItemRecord): firebase.firestore.DocumentData => {
    return ir;
  },

  fromFirestore: (
    snapshot: firebase.firestore.QueryDocumentSnapshot,
    options: firebase.firestore.SnapshotOptions
  ): ItemRecord => {
    const data = snapshot.data(options);
    return {
      id: data.id,
      type: data.type,
      title: data.title,
      url: data.url,
    };
  },
};

// TODO: Add ability to page through list content

export type ItemListId = string;

export interface ItemListRecord {
  id: ItemListId;
  title: string;

  // The representation of items will likely change if/when paging is
  // implemented.
  items: ItemRecord[];
}

// The items themselves are always stored in a subcollection. How is this
// represented in Firebase?
const ITEMS_COLLECTION = "items";
const ITEM_LISTS_COLLECTION = "item_lists";

export const getItemList = async (
  database: Database,
  uid: UserId,
  itemListId: ItemListId
  // TODO: Filtering/sorting arguments will go here eventually.
): Promise<ItemListRecord | null> => {
  const itemListRef = database
    .getHandle()
    .collection(USERS_COLLECTION)
    .doc(uid)
    .collection(ITEM_LISTS_COLLECTION)
    .doc(itemListId);

  const itemListDocPromise = itemListRef.get();
  const allItemsPromise = itemListRef
    .collection(ITEMS_COLLECTION)
    .withConverter(ITEM_RECORD_CONVERTER)
    .get();

  const [itemListDoc, allItemsQuerySnapshot] = await Promise.all([
    itemListDocPromise,
    allItemsPromise,
  ]);

  if (!itemListDoc.exists) {
    // User does not exist or item list does not exist
    return null;
  }

  const allItems: ItemRecord[] = [];
  allItemsQuerySnapshot.forEach((itemDoc) => allItems.push(itemDoc.data()));

  return {
    id: itemListDoc.get("id") as ItemListId,
    title: itemListDoc.get("title"),
    items: allItems,
  };
};
