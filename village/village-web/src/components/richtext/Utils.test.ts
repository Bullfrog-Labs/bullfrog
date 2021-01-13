import { Node } from "slate";
import {
  richTextStringPreview,
  stringToSlateNode,
  slateNodeToString,
  mentionPreview,
  findMentionsInPosts,
} from "./Utils";
import { doc1, userPosts2 } from "../../testing/Fixtures";

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

test("extract preview for mention in p", () => {
  const previewDoc = mentionPreview(doc1, [0, 0, 1]);
  expect(Node.string(previewDoc[0])).toEqual(
    "⋯As I was saying in  Mango is goooooood.⋯"
  );
});

test("extract preview for mention in ul", () => {
  const previewDoc = mentionPreview(doc1, [0, 1, 1, 0, 1]);
  expect(Node.string(previewDoc[0])).toEqual("⋯heere we ⋯");
});

test("find mentions in a post", () => {
  const mentions = findMentionsInPosts(userPosts2, "iVZbiDaFC9RGOBvX9PGB");
  expect(mentions.length).toEqual(1);
});
