import { Documents } from "kmgmt-common";
import { richTextStringPreview } from "./Utils";

test("rich text string preview works for paragraph", () => {
  const content = "foo bar baz";
  const richText = Documents.paragraph(content).children;

  const preview = richTextStringPreview(richText);
  expect(preview).toEqual(content);
});
