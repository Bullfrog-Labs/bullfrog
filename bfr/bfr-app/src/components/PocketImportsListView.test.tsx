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
  };

  const { getByText } = render(
    <PocketImportItemCard pocketImportItem={mockPocketImportItem} />
  );

  const expectedElements = [
    getByText(mockPocketImportItem.title!),
    getByText(mockPocketImportItem.description!),
  ];

  expectedElements.forEach((el) => expect(el).toBeInTheDocument());
});
