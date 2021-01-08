import {
  richTextStringPreview,
  stringToSlateNode,
  slateNodeToString,
} from "./Utils";

test("rich text string preview works for paragraph", () => {
  const content = "foo bar baz";
  const richText = stringToSlateNode(content);

  const preview = richTextStringPreview(richText);
  expect(preview).toEqual(content);
});

test("node <-> string is consistent", () => {
  const content = "foo bar baz";
  const richText = stringToSlateNode(content);

  const stringValue = slateNodeToString(richText);
  expect(stringValue).toEqual(content);
});
