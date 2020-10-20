import { Editor, Node, Element, Transforms } from "slate";

export const withSectionTitles = (editor: Editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    const isSectionTitle = (n: Node) => {
      return Element.isElement(n) && n.type === "section-title";
    };

    const isSection = Element.isElement(node) && node.type === "section";

    // Rule 0. No top-level section titles
    if (isSectionTitle(node)) {
      if (path.length === 1) {
        Transforms.setNodes(editor, { type: "paragraph" }, { at: path });
      }
    }

    if (!isSection) {
      normalizeNode(entry);
      return;
    }

    // Rule 1. First node should be a section title.
    const first = Node.child(node, 0);
    if (!isSectionTitle(first)) {
      const blankSectionTitle = {
        type: "section-title",
        children: [{ text: "" }],
      };
      const sectionTitleLoc = path.slice();
      sectionTitleLoc.push(0);
      Transforms.insertNodes(editor, blankSectionTitle, {
        at: sectionTitleLoc,
      });
    }

    // Rule 2. Only the first node is a section title.
    const children = Array.from(Node.children(node, [])).slice(1);
    for (const [child, childPath] of children) {
      if (isSectionTitle(child)) {
        const childFullPath = path.concat(childPath);
        Transforms.setNodes(
          editor,
          { type: "paragraph" },
          { at: childFullPath }
        );
      }
    }

    normalizeNode(entry);
  };

  return editor;
};
