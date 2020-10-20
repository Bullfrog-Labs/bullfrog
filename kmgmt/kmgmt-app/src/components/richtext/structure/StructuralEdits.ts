import { Transforms, Editor, Path, Range, Node, Element, Text } from "slate";
import { ReactEditor } from "slate-react";
import {
  isSectionActive,
  isSectionTitleActive,
  getSmallestEnclosingSection,
} from "./StructuralQueries";

export const denestBlock = (editor: ReactEditor) => {
  // TODO: does not work properly with expanded ranges yet.

  if (!editor.selection || Range.isExpanded(editor.selection)) {
    return;
  }

  // get non-text element
  let nodePath = Range.start(editor.selection).path;
  let node = Node.get(editor, nodePath);

  if (Text.isText(node)) {
    nodePath = nodePath.slice(0, -1);
    node = Node.get(editor, nodePath);
  }

  if (Element.isElement(node) && node.type === "section-title") {
    nodePath = nodePath.slice(0, -1);
    node = Node.get(editor, nodePath);
  }

  // a top-level section is being denested
  if (
    nodePath.length === 1 &&
    Element.isElement(node) &&
    node.type === "section"
  ) {
    // turn the section title into a paragraph
    const sectionTitlePath = nodePath.slice();
    sectionTitlePath.push(0);
    Transforms.setNodes(
      editor,
      { type: "paragraph" },
      { at: sectionTitlePath }
    );

    // node path unchanged by above edits
    Transforms.unwrapNodes(editor, { at: nodePath });
    return;
  }

  const matchFn = (n: Node) => {
    // need to denest from a section, so if there is no section, skip
    // denesting
    if (!isSectionActive(editor)) {
      return false;
    }

    // denesting on a section title means to denest the section itself
    if (isSectionTitleActive(editor)) {
      return "type" in n && n.type === "section";
    } else {
      return Editor.isBlock(editor, n);
    }
  };

  // WTFNOTE: some things in Slate works in weird ways
  // 1. A path intersects with another path if they share any common prefix
  // 2. Tree traversal with `at` set to editor.selection traverses over the root
  // node, because all traversals hit the root node

  Transforms.liftNodes(editor, {
    mode: "lowest",
    match: matchFn,
  });
};

export const moveOut = (editor: Editor) => {
  if (!editor.selection) {
    return;
  }
  // get largest enclosing section
  const largestEnclosingSection = getSmallestEnclosingSection(
    editor,
    editor.selection
  );

  if (largestEnclosingSection.length === 0) {
    // do nothing if at highest block
    return;
  }

  // move to next block
  const destination = Path.next(largestEnclosingSection);

  // TODO: Only moves lowest nodes.
  // TODO: Selection to the end of a block begins in the next block
  Transforms.moveNodes(editor, { to: destination });
};

export const nestSection = (editor: Editor) => {
  Transforms.wrapNodes(editor, {
    type: "section",
    children: [],
  });
};
