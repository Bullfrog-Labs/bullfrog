import { Database } from "./Database";
import { getContentType, ContentType } from "../../util/ContentType";

/**
 * getItemSet: Get a set of items.
 * @param database
 */

// If the collection cannot be accessed according Firestore security rules, an
// exception will be thrown. If the collection can be accessed, but is not
// actually present, an empty list will be returned.
// NOTE: The representation of items will likely change if/when paging is
// implemented.
export const getItemSet = (database: Database) => async <T>(
  itemRecordConverter: firebase.firestore.FirestoreDataConverter<T>,
  path: string, // this path should refer to a collection of items
  orderBy?: [string, "desc" | "asc" | undefined][],
  where?: [string, firebase.firestore.WhereFilterOp, any]
): Promise<T[]> => {
  // TODO: Implement Filtering/sorting/paging
  // TODO: Add ability to page through list content
  async function getQuerySnapshot() {
    let query: firebase.firestore.Query<firebase.firestore.DocumentData> = database
      .getHandle()
      .collection(path);

    if (where) {
      query = query.where(where[0], where[1], where[2]);
    }

    if (orderBy) {
      orderBy.forEach((clause) => {
        query = query.orderBy(clause[0], clause[1]);
      });
    }

    if (query) {
      return query.withConverter(itemRecordConverter).get();
    } else {
      return [];
    }
  }

  const querySnapshot = await getQuerySnapshot();

  const allItems: T[] = [];
  querySnapshot.forEach((item) => allItems.push(item.data()));

  return allItems;
};

export type GetItemSetFn<T> = (
  itemRecordConverter: firebase.firestore.FirestoreDataConverter<T>,
  path: string, // this path should refer to a collection of items
  orderBy?: [string, "desc" | "asc" | undefined][],
  where?: [string, firebase.firestore.WhereFilterOp, any]
) => Promise<T[]>;

/**
 * updateItem: Update an item.
 * @param database
 */
export const updateItem = (database: Database) => async <T>(
  itemRecordConverter: firebase.firestore.FirestoreDataConverter<T>,
  path: string, // this path should refer to a collection of items
  id: string,
  item: T
) => {
  const fbItem = itemRecordConverter.toFirestore(item);
  database.getHandle().collection(path).doc(id).update(fbItem);
};

export type UpdateItemFn<T> = (
  itemRecordConverter: firebase.firestore.FirestoreDataConverter<T>,
  path: string, // this path should refer to a collection of items
  id: string,
  item: T
) => Promise<void>;

export interface PocketImportItemRecord {
  pocket_item_id: string;
  title?: string | undefined;
  url: string;
  authors?: string[];
  description?: string;
  text?: string;
  saveTime?: Date;
  estReadTimeMinutes?: number | undefined;
  contentType?: ContentType;
  status?: number;
  snoozeEndTime?: Date;
}

export enum ItemStatus {
  Unread = 0,
  Archived = 1,
  Deleted = 2,
}

export const PocketImportItemRecordConverter = {
  /**
   * This can only be used to update the mutable fields.
   * @param pocketItem
   */
  toFirestore: (
    pocketItem: PocketImportItemRecord
  ): firebase.firestore.DocumentData => {
    let data = {};
    if (pocketItem.status) {
      data = Object.assign(data, { status: pocketItem.status });
    }
    if (pocketItem.snoozeEndTime) {
      data = Object.assign(data, { snoozeEndTime: pocketItem.snoozeEndTime });
    }
    return data;
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
      status: data.status || 0,
      snoozeEndTime: data.snoozeEndTime?.toDate(),
    };
  },
};
