import { Editor, Transforms } from "slate";
import { Block, isList } from "./Types";

// TODO: Implement event handling for non-section blocks: block-quote,
//       bulleted-list, list item and numbered list.

export const isBlockActive = (editor: Editor, block: Block) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === block,
  });

  return !!match;
};

export const toggleBlock = (editor: Editor, block: Block) => {
  const isActive = isBlockActive(editor, block);
  // const isList = LIST_TYPES.includes(block);

  Transforms.unwrapNodes(editor, {
    match: (n) => {
      return "type" in n && isList(n.type as string);
    },
    split: true,
  });

  Transforms.setNodes(editor, {
    type: isActive ? "paragraph" : isList(block) ? "list-item" : block,
  });

  if (!isActive && isList(block)) {
    const blockNode = { type: block, children: [] };
    Transforms.wrapNodes(editor, blockNode);
  }
};
