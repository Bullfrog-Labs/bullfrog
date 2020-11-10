import React from "react";
import { render } from "@testing-library/react";
import {
  PocketImportItemCard,
  PocketImportItemRecord,
} from "./PocketImportsListView";

test("renders fully-populated pocket import item card", () => {
  const mockPocketImportItem: PocketImportItemRecord = {
    pocket_item_id: "123",
    title: "test title",
    url: "http://test.url/foo",
    authors: ["Alice", "Bob"],
    description: "This is a great article",
    saveTime: new Date(1995, 11, 17),
    estReadTimeMinutes: 7,
  };

  const { getByText } = render(
    <PocketImportItemCard pocketImportItem={mockPocketImportItem} />
  );

  const expectedElements = [
    getByText(mockPocketImportItem.title!),
    getByText(mockPocketImportItem.description!),
    getByText(new RegExp(mockPocketImportItem.authors!.join(", "))),
    getByText("Dec 17, 1995, 12:00 AM"),
    getByText("- 7 mins"),
  ];

  expectedElements.forEach((el) => expect(el).toBeInTheDocument());
});
