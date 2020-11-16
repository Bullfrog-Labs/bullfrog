import * as log from "loglevel";
import { Database } from "./Database";
import * as R from "ramda";

// If the collection cannot be accessed according Firestore security rules, an
// exception will be thrown. If the collection can be accessed, but is not
// actually present, an empty list will be returned.
// NOTE: The representation of items will likely change if/when paging is
// implemented.
const getItemSetFn = async <T>(
  database: Database,
  itemRecordConverter: firebase.firestore.FirestoreDataConverter<T>,
  path: string, // this path should refer to a collection of items
  orderBy?: [string, "desc" | "asc" | undefined] | undefined
): Promise<T[]> => {
  // TODO: Implement Filtering/sorting/paging
  // TODO: Add ability to page through list content
  async function getQuerySnapshot() {
    if (orderBy) {
      return database
        .getHandle()
        .collection(path)
        .orderBy(orderBy[0], orderBy[1])
        .withConverter(itemRecordConverter)
        .get();
    } else {
      return database
        .getHandle()
        .collection(path)
        .withConverter(itemRecordConverter)
        .get();
    }
  }

  const querySnapshot = await getQuerySnapshot();

  const allItems: T[] = [];
  querySnapshot.forEach((item) => allItems.push(item.data()));

  return allItems;
};

const getItemSet = R.curry(getItemSetFn);

export type GetItemSetFn<T> = (
  itemRecordConverter: firebase.firestore.FirestoreDataConverter<T>,
  path: string, // this path should refer to a collection of items
  orderBy?: [string, "desc" | "asc" | undefined] | undefined
) => Promise<T[]>;

export { getItemSet };
