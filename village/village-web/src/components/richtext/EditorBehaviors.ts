import { Editor, Text, Transforms } from "slate";

// EditableTypography layout ensures that there is only a single text node in
// the editor, with no newlines.
export const withEditableTypographyLayout = (editor: Editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    if (Text.isText(node)) {
      // Make sure that there are no newlines in the text
      const newNode = {
        text: node.text.replace(/\r?\n|\r/g, ""),
      };
      Transforms.setNodes(editor, newNode, { at: path });
    } else {
      // Merge all nodes into a single text node
      if (path.length > 0 && path[path.length - 1] !== 0) {
        Transforms.mergeNodes(editor, { at: path, voids: true });
      }
    }

    return normalizeNode(entry);
  };

  return editor;
};
