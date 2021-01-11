import { RichText } from "./Types";
import { createEditor, Editor, Node as SlateNode, Path } from "slate";

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
    children: [
      {
        type: "p",
        children: [{ text: s }],
      },
    ],
  },
];

export const slateNodeToString = (text: RichText): string =>
  SlateNode.string(text[0]);

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

export const mentionPreview = (body: RichText, path: Path): any => {
  const editor = createEditor();
  editor.children = body;
  const block = Editor.above(editor, { at: path });
  const node = block && block[0];
  if (node) node["noGutter"] = true;
  //const afterBlock = Editor.after(editor, path, { unit: "block" });
  //const blockRange = aboveBlock && Editor.range(editor, aboveBlock, afterBlock);

  return node && [{ children: [node] }];
};
