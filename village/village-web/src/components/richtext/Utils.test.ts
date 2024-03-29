import { Node, Text } from "slate";
import {
  richTextStringPreview,
  stringToTopLevelRichText,
  slateNodeToString,
  mentionPreview,
  findMentionsInPosts,
  postPreviewStringFromStart,
  EDITABLE_TYPOGRAPHY_TEXT_NODE_PATH,
} from "./Utils";
import { doc1, userPosts2 } from "../../testing/Fixtures";

test("gets the correct path for text node in editable typography", () => {
  const content = "foo bar baz";
  const richText = stringToTopLevelRichText(content);

  const textNode = Node.get(
    { children: richText },
    EDITABLE_TYPOGRAPHY_TEXT_NODE_PATH
  );
  expect(Text.isText(textNode)).toBeTruthy();
});

test("rich text string preview works for paragraph", () => {
  const content = "foo bar baz";
  const richText = stringToTopLevelRichText(content);

  const preview = richTextStringPreview(richText);
  expect(preview).toEqual(content);
});

test("node <-> string is consistent", () => {
  const content = "foo bar baz";
  const richText = stringToTopLevelRichText(content);

  const stringValue = slateNodeToString(richText);
  expect(stringValue).toEqual(content);
});

test("string preview truncates if too long", () => {
  const content = "foo bar baz";
  const richText = stringToTopLevelRichText(content);

  const stringValue = postPreviewStringFromStart(richText, 5);
  expect(stringValue).toEqual("foo ⋯");
});

test("string preview truncates if min length", () => {
  const content = "foo bar baz";
  const richText = stringToTopLevelRichText(content);

  const stringValue = postPreviewStringFromStart(richText, 2);
  expect(stringValue).toEqual(" ⋯");
});

test("string preview doesnt truncates length ok", () => {
  const content = "foo bar baz";
  const richText = stringToTopLevelRichText(content);

  const stringValue = postPreviewStringFromStart(richText, 20);
  expect(stringValue).toEqual("foo bar baz");
});

test("extract preview for mention in p", () => {
  const [previewDoc] = mentionPreview(doc1, [0, 0, 1]);
  expect(Node.string(previewDoc[0])).toEqual(
    "As I was saying in  Mango is goooooood.here we goooooooheere we "
  );
});

test("extract preview for mention in ul", () => {
  const [previewDoc] = mentionPreview(doc1, [0, 1, 1, 0, 1]);
  expect(Node.string(previewDoc[0])).toEqual("heere we ");
});

test("find mentions in a post", () => {
  const mentions = findMentionsInPosts(userPosts2, "iVZbiDaFC9RGOBvX9PGB");
  expect(mentions.length).toEqual(1);
});
