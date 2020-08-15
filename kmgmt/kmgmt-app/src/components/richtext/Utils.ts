import { RichText } from "./Types";
import { Node as SlateNode } from "slate";

export const EMPTY_RICH_TEXT: RichText = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

export const richTextParagraph = (content: string): RichText => {
  return [
    {
      type: "paragraph",
      children: [{ text: content }],
    },
  ];
};

// TODO: This should probably be converted to a TSX function, so that the
// preview is a React component. Code from Rendering.tsx can probably be used to
// generate the preview.
export const richTextStringPreview = (
  richText: RichText
): string | undefined => {
  if (!richText || richText.length === 0) {
    return undefined;
  }

  return Array.from(SlateNode.texts(richText[0]), ([text, path]) => text.text)
    .slice(0, 3)
    .join("\n");
};
