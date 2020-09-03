import { RichText } from "kmgmt-common";
import Slate from "slate";

// TODO: This should probably be converted to a TSX function, so that the
// preview is a React component. Code from Rendering.tsx can probably be used to
// generate the preview.
export const richTextStringPreview = (
  richText: RichText
): string | undefined => {
  if (!richText || richText.length === 0) {
    return undefined;
  }

  return Array.from(Slate.Node.texts(richText[0]), ([text, path]) => text.text)
    .slice(0, 3)
    .join("\n");
};
