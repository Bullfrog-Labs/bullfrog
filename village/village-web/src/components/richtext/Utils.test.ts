import { Node } from "slate";
import {
  richTextStringPreview,
  stringToSlateNode,
  slateNodeToString,
  mentionPreview,
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

const doc0 = [
  {
    children: [
      {
        type: "p",
        children: [{ text: "paragraph 1" }],
      },
      {
        type: "p",
        children: [{ text: "paragraph 2" }],
      },
      {
        type: "p",
        children: [{ text: "paragraph 3" }],
      },
    ],
  },
];

const doc1 = [
  {
    children: [
      {
        type: "p",
        children: [
          { text: "As I was saying in " },
          {
            type: "mention",
            value: "Hey!",
            exists: true,
            authorUsername: "l4stewar",
            children: [{ text: "" }],
            authorId: "7WSdaWnlfEbBszRiQxuL1zs1vZq2",
            postId: "iVZbiDaFC9RGOBvX9PGB",
          },
          { text: " Mango is goooooood." },
        ],
      },
      {
        type: "ul",
        children: [
          {
            children: [{ type: "p", children: [{ text: "here we gooooooo" }] }],
            type: "li",
          },
          {
            type: "li",
            children: [
              {
                children: [
                  { text: "heere we " },
                  {
                    postId: "d45fc801-2438-4dd7-829b-300da4994f0e",
                    authorUsername: "l4stewar",
                    exists: false,
                    value: "Go",
                    authorId: "7WSdaWnlfEbBszRiQxuL1zs1vZq2",
                    children: [{ text: "" }],
                    type: "mention",
                  },
                  { text: "" },
                ],
                type: "p",
              },
            ],
          },
        ],
      },
      { children: [{ text: "adsadasdasdas" }], type: "p" },
      { children: [{ text: "New Section!" }], type: "h5" },
      {
        type: "p",
        children: [
          { text: "he", bold: true },
          { bold: true, text: "he", italic: true },
          { text: "hehehe", bold: true },
        ],
      },
      {
        type: "p",
        children: [
          { text: "mentioning Nim's " },
          {
            authorUsername: "nybbles",
            value: "Mango",
            postId: "xXpouaBQ0tEUANtwFcg2",
            authorId: "ArX0xuTOidSNHzbMTd5IRK0nqgb2",
            exists: true,
            children: [{ text: "" }],
            type: "mention",
          },
          { text: " post" },
        ],
      },
      {
        type: "p",
        children: [
          { text: "" },
          {
            authorUsername: "nybbles",
            authorId: "ArX0xuTOidSNHzbMTd5IRK0nqgb2",
            exists: true,
            value: "Mango",
            children: [{ text: "" }],
            type: "mention",
            postId: "xXpouaBQ0tEUANtwFcg2",
          },
          { text: "" },
        ],
      },
      {
        children: [
          { text: "" },
          {
            exists: true,
            postId: "b73b398d-1cfe-468a-9f88-a911532a52ac",
            value: "Mango",
            children: [{ text: "" }],
            type: "mention",
            authorId: "7WSdaWnlfEbBszRiQxuL1zs1vZq2",
            authorUsername: "l4stewar",
          },
          { text: "" },
        ],
        type: "p",
      },
    ],
  },
];
