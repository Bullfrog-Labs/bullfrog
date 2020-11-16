import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react";
import {
  PocketImportItemCard,
  PocketImportItemRecord,
  PocketImportsListView,
} from "./PocketImportsListView";
import { AuthContext } from "../services/auth/Auth";
import { DateTime } from "luxon";

const mockPocketImportItem1: PocketImportItemRecord = {
  pocket_item_id: "123",
  title: "test title 1",
  url: "http://test.url/foo",
  authors: ["Alice", "Bob"],
  description: "This is a great article",
  saveTime: new Date(1995, 11, 17),
  estReadTimeMinutes: 7,
  contentType: "Quick Read",
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
  async function getItemSet<PocketImportItemRecord>(
    itemRecordConverter: firebase.firestore.FirestoreDataConverter<
      PocketImportItemRecord
    >,
    path: string, // this path should refer to a collection of items
    orderBy?: [string, "desc" | "asc" | undefined] | undefined
  ) {
    return [mockPocketImportItem1];
  }

  const authState = {
    uid: "foobar",
  };

  const { getByText } = render(
    <AuthContext.Provider value={authState as firebase.User}>
      <PocketImportsListView getItemSet={getItemSet} />
    </AuthContext.Provider>
  );

  await waitFor(() => getByText(mockPocketImportItem1.title!));
  await waitFor(() => getByText(mockPocketImportItem1.description!));
  await waitFor(() =>
    getByText(new RegExp(mockPocketImportItem1.authors!.join(", ")))
  );
  await waitFor(() => getByText("Dec 17, 1995, 12:00 AM"));
  await waitFor(() => getByText("- 7 mins"));
});

test("filters old items when interval selected", async () => {
  async function getItemSet<PocketImportItemRecord>(
    itemRecordConverter: firebase.firestore.FirestoreDataConverter<
      PocketImportItemRecord
    >,
    path: string, // this path should refer to a collection of items
    orderBy?: [string, "desc" | "asc" | undefined] | undefined
  ) {
    return [mockPocketImportItem1, mockPocketImportItem2];
  }

  const authState = {
    uid: "foobar",
  };

  const { getByText, queryByText } = render(
    <AuthContext.Provider value={authState as firebase.User}>
      <PocketImportsListView getItemSet={getItemSet} />
    </AuthContext.Provider>
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
  async function getItemSet<PocketImportItemRecord>(
    itemRecordConverter: firebase.firestore.FirestoreDataConverter<
      PocketImportItemRecord
    >,
    path: string, // this path should refer to a collection of items
    orderBy?: [string, "desc" | "asc" | undefined] | undefined
  ) {
    return [mockPocketImportItem1, mockPocketImportItem2];
  }

  const authState = {
    uid: "foobar",
  };

  const { getByText, queryByText } = render(
    <AuthContext.Provider value={authState as firebase.User}>
      <PocketImportsListView getItemSet={getItemSet} />
    </AuthContext.Provider>
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
