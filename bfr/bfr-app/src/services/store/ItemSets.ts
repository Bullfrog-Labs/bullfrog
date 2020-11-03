import * as log from "loglevel";
import { Database } from "./Database";

// If the collection cannot be accessed according Firestore security rules, an
// exception will be thrown. If the collection can be accessed, but is not
// actually present, an empty list will be returned.
// NOTE: The representation of items will likely change if/when paging is
// implemented.
export const getItemSet = async <T>(
  database: Database,
  itemRecordConverter: firebase.firestore.FirestoreDataConverter<T>,
  path: string // this path should refer to a collection of items
): Promise<T[]> => {
  // TODO: Implement Filtering/sorting/paging
  // TODO: Add ability to page through list content
  const querySnapshot = await database
    .getHandle()
    .collection(path)
    .withConverter(itemRecordConverter)
    .get();

  const allItems: T[] = [];
  querySnapshot.forEach((item) => allItems.push(item.data()));

  return allItems;
};
