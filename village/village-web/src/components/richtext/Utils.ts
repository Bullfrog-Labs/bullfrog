import { RichText } from "./Types";
import { Node as SlateNode } from "slate";

export const EMPTY_RICH_TEXT: RichText = [
  {
    children: [
      {
        type: "p",
        children: [{ text: "" }],
      },
    ],
  },
];

export const stringToSlateNode = (s: string): RichText => [
  {
    type: "p",
    children: [{ text: s }],
  },
];

export const slateNodeToString = (text: RichText): string =>
  SlateNode.leaf(text[0], [0]).text;

// TODO: This should probably be converted to a TSX function, so that the
// preview is a React component. Code from Rendering.tsx can probably be used to
// generate the preview.
export const richTextStringPreview = (
  richText: RichText | string // '| string' is temporary - working around data form transition
): string | undefined => {
  if (typeof richText === "string") {
    return richText;
  }

  if (!richText || richText.length === 0) {
    return undefined;
  }

  return Array.from(SlateNode.texts(richText[0]), ([text, path]) => text.text)
    .slice(0, 3)
    .join("\n");
};
