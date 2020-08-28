import { Documents } from "./Document";
import { Node } from "slate";

test("create single paragraph document", () => {
  const d = Documents.paragraph("test paragraph");
  expect(Node.string(d)).toBe("test paragraph");
});

test("append a paragraph to a doc", () => {
  const d1 = Documents.paragraph("test paragraph");
  const d2 = Documents.appendParagraph(d1, "test paragraph 2");
  console.log("%o", d2);
  expect(Node.string(d2)).toBe("test paragraphtest paragraph 2");
});
