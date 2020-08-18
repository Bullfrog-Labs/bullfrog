import { richTextStringPreview, richTextParagraph } from "./Utils";

test("rich text string preview works for paragraph", () => {
  const content = "foo bar baz";
  const richText = richTextParagraph(content);

  const preview = richTextStringPreview(richText);
  expect(preview).toEqual(content);
});
