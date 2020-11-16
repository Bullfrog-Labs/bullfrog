import { Database } from "./Database";
import * as R from "ramda";

/**
 * getItemSet: Get a set of items.
 * @param database
 */

// If the collection cannot be accessed according Firestore security rules, an
// exception will be thrown. If the collection can be accessed, but is not
// actually present, an empty list will be returned.
// NOTE: The representation of items will likely change if/when paging is
// implemented.
const getItemSet = (database: Database) => async <T>(
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
const updateItem = (database: Database) => async <T>(
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

export { getItemSet, updateItem };
