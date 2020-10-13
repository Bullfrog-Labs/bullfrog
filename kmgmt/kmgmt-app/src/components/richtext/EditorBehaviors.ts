import { Editor, Text, Transforms } from "slate";
import { STRUCTURE_BLOCKS } from "./Types";
import { isBlockActive, toggleBlock } from "./Blocks";

// Ensures that inserting a break in the middle of a structure block (i.e.
// headings) causes the new block to be of the same type of structure block.
export const withResetBlockOnInsertBreak = (editor: Editor) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    insertBreak();

    // TODO: Figure out if this behavior makes sense, or what it even means
    // TODO: Disabling because this is buggy, need to fix to work within structural sections paradigm
    /*
    for (let block in STRUCTURE_BLOCKS.filter((x) =>
      isBlockActive(editor, x)
    )) {
      toggleBlock(editor, block);
    }
    */
  };

  return editor;
};

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
