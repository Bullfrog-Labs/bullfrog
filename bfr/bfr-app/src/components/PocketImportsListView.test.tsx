import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { PocketImportsListView } from "./PocketImportsListView";
import {
  PocketImportItemRecord,
  ItemStatus,
  GetItemSetFn,
} from "../services/store/ItemSets";
import { PocketImportItemCard } from "./PocketImportItemCard";
import { AuthContext } from "../services/auth/Auth";
import { DateTime } from "luxon";
import * as log from "loglevel";
import { Logging } from "kmgmt-common";

Logging.configure(log);

const mockPocketImportItem1: PocketImportItemRecord = {
  pocket_item_id: "123",
  title: "test title 1",
  url: "http://test.url/foo",
  authors: ["Alice", "Bob"],
  description: "This is a great article",
  saveTime: new Date(1995, 11, 17),
  estReadTimeMinutes: 7,
  contentType: "Quick Read",
  status: ItemStatus.Unread,
};

const mockPocketImportItem2: PocketImportItemRecord = {
  pocket_item_id: "124",
  title: "test title 2",
  url: "http://test.url/foo",
  authors: ["Alice", "Bob"],
  description: "This is a great article",
  saveTime: DateTime.local().toJSDate(),
  estReadTimeMinutes: 7,
  contentType: "Long Read",
  status: ItemStatus.Unread,
};

function copy(records: PocketImportItemRecord[]) {
  return records.map((record) => Object.assign({}, record));
}

async function updateItem<PocketImportItemRecord>(
  itemRecordConverter: firebase.firestore.FirestoreDataConverter<
    PocketImportItemRecord
  >,
  path: string,
  id: string,
  item: PocketImportItemRecord
) {}

const getItemSetFromRecords = (records: PocketImportItemRecord[]) => async (
  itemRecordConverter: firebase.firestore.FirestoreDataConverter<
    PocketImportItemRecord
  >,
  path: string, // this path should refer to a collection of items
  orderBy?: [string, "desc" | "asc" | undefined][],
  where?: [string, firebase.firestore.WhereFilterOp, any]
) => {
  return copy(records);
};

const AuthdListView = (props: {
  getItemSet: GetItemSetFn<PocketImportItemRecord>;
}) => {
  const authState = {
    uid: "foobar",
  };
  return (
    <AuthContext.Provider value={authState as firebase.User}>
      <PocketImportsListView
        getItemSet={props.getItemSet}
        updateItem={updateItem}
        title="Inbox"
      />
    </AuthContext.Provider>
  );
};

test("renders fully-populated pocket import item card", () => {
  const { getByText } = render(
    <PocketImportItemCard pocketImportItem={mockPocketImportItem1} />
  );

  const expectedElements = [
    getByText(mockPocketImportItem1.title!),
    getByText(mockPocketImportItem1.description!),
    getByText(new RegExp(mockPocketImportItem1.authors!.join(", "))),
    getByText("Dec 17, 1995, 12:00 AM"),
    getByText("- 7 mins"),
  ];

  expectedElements.forEach((el) => expect(el).toBeInTheDocument());
});

test("renders fully-populated pocket import item card in list view", async () => {
  const getItemSet = getItemSetFromRecords([mockPocketImportItem1]);
  const { getByText } = render(<AuthdListView getItemSet={getItemSet} />);

  await waitFor(() => getByText(mockPocketImportItem1.title!));
  await waitFor(() => getByText(mockPocketImportItem1.description!));
  await waitFor(() =>
    getByText(new RegExp(mockPocketImportItem1.authors!.join(", ")))
  );
  await waitFor(() => getByText("Dec 17, 1995, 12:00 AM"));
  await waitFor(() => getByText("- 7 mins"));
});

test("filters old items when interval selected", async () => {
  const getItemSet = getItemSetFromRecords([
    mockPocketImportItem1,
    mockPocketImportItem2,
  ]);

  const { getByText, queryByText } = render(
    <AuthdListView getItemSet={getItemSet} />
  );

  await waitFor(() => getByText(mockPocketImportItem1.title!));
  await waitFor(() => getByText(mockPocketImportItem2.title!));

  const select = await waitFor(() => getByText("Interval"));
  expect(select).toBeInstanceOf(HTMLSpanElement);
  fireEvent.click(select);

  const pastDayItem = await waitFor(() => getByText("Past Day"));
  expect(select).toBeInstanceOf(HTMLSpanElement);
  fireEvent.click(pastDayItem);

  await waitFor(() => getByText(mockPocketImportItem2.title!));
  expect(queryByText(mockPocketImportItem1.title!)).toBeNull();
});

test("group items when groupBy selected", async () => {
  const getItemSet = getItemSetFromRecords([
    mockPocketImportItem1,
    mockPocketImportItem2,
  ]);

  const { getByText, queryByText } = render(
    <AuthdListView getItemSet={getItemSet} />
  );

  await waitFor(() => getByText(mockPocketImportItem1.title!));
  await waitFor(() => getByText(mockPocketImportItem2.title!));

  expect(queryByText("Long Read")).toBeNull();
  expect(queryByText("Quick Read")).toBeNull();

  const select = await waitFor(() => getByText("Group"));
  expect(select).toBeInstanceOf(HTMLSpanElement);
  fireEvent.click(select);

  const pastDayItem = await waitFor(() => getByText("Content Type"));
  expect(select).toBeInstanceOf(HTMLSpanElement);
  fireEvent.click(pastDayItem);

  await waitFor(() => getByText(mockPocketImportItem1.title!));
  await waitFor(() => getByText(mockPocketImportItem2.title!));
  await waitFor(() => getByText("Long Read"));
  await waitFor(() => getByText("Quick Read"));
});

test("snooze removes item", async () => {
  const getItemSet = getItemSetFromRecords([
    mockPocketImportItem1,
    mockPocketImportItem2,
  ]);

  const { getByText, queryByText, getByTestId } = render(
    <AuthdListView getItemSet={getItemSet} />
  );

  await waitFor(() => getByText(mockPocketImportItem1.title!));
  await waitFor(() => getByText(mockPocketImportItem2.title!));

  const select = await waitFor(() => getByTestId("snooze-button-123"));
  expect(select).toBeInstanceOf(HTMLButtonElement);
  fireEvent.click(select);

  const pastDayItem = await waitFor(() => getByText("1 Day"));
  expect(select).toBeInstanceOf(HTMLButtonElement);
  fireEvent.click(pastDayItem);

  await waitFor(() => getByText(mockPocketImportItem2.title!));
  expect(queryByText(mockPocketImportItem1.title!)).toBeNull();
});

test("archive removes item", async () => {
  const getItemSet = getItemSetFromRecords([
    mockPocketImportItem1,
    mockPocketImportItem2,
  ]);

  const { getByText, queryByText, getByTestId } = render(
    <AuthdListView getItemSet={getItemSet} />
  );

  await waitFor(() => getByText(mockPocketImportItem1.title!));
  await waitFor(() => getByText(mockPocketImportItem2.title!));

  const select = await waitFor(() => getByTestId("archive-button-123"));
  expect(select).toBeInstanceOf(HTMLButtonElement);
  fireEvent.click(select);

  await waitFor(() => getByText(mockPocketImportItem2.title!));
  expect(queryByText(mockPocketImportItem1.title!)).toBeNull();
});

test("delete removes item", async () => {
  const getItemSet = getItemSetFromRecords([
    mockPocketImportItem1,
    mockPocketImportItem2,
  ]);

  const { getByText, queryByText, getByTestId } = render(
    <AuthdListView getItemSet={getItemSet} />
  );

  await waitFor(() => getByText(mockPocketImportItem1.title!));
  await waitFor(() => getByText(mockPocketImportItem2.title!));

  const select = await waitFor(() => getByTestId("delete-button-123"));
  expect(select).toBeInstanceOf(HTMLButtonElement);
  fireEvent.click(select);

  await waitFor(() => getByText(mockPocketImportItem2.title!));
  expect(queryByText(mockPocketImportItem1.title!)).toBeNull();
});
