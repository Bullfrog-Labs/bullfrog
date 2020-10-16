import React, { FunctionComponent } from "react";
import { Editor, Range, Node, Transforms, Element, Text, Path } from "slate";
import { ReactEditor } from "slate-react";
import { StructureMode } from "./Types";

export const isSectionActive = (editor: Editor) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === "section",
  });

  return !!match;
};

export const isSectionTitleActive = (editor: Editor) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === "section-title",
  });

  return !!match;
};

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

const zip = <T extends unknown>(arr1: T[], arr2: T[]): Array<T[]> =>
  arr1.map((k, i) => [k, arr2[i]]);

const getEnclosingBlockPath = (editor: Editor, path: Path): Path => {
  const ancestors = Array.from(Node.ancestors(editor, path, { reverse: true }));
  for (const entry of ancestors) {
    const [ancestor, ancestorPath] = entry;
    if (Element.isElement(ancestor)) {
      return ancestorPath;
    }
  }
  throw new Error("no blocks all the way to the root");
};

const getLargestEnclosingSection = (editor: Editor, range: Range): Path => {
  // Returns empty path [] to represent that the largest enclosing section is
  // the top-level document.

  // TODO: consider how this would work with nested blocks. probably need to
  // check whether the block being returned is actually of type "section".

  const [startPath, endPath] = Range.edges(range).map((p) =>
    getEnclosingBlockPath(editor, p.path)
  );
  const samePaths = Path.compare(startPath, endPath) === 0;

  if (samePaths) {
    // the largest enclosing section is the one directly up from the block.
    // return the parent block, which we assume is a section or the top-level
    // document.
    const path = getEnclosingBlockPath(editor, Range.start(range).path);

    return path.slice(0, -1);
  } else {
    // walk both start and end paths until there's a mismatch.
    const [startPath, endPath] = Range.edges(range);
    const enclosingPath: number[] = [];

    for (const xs of zip(
      getEnclosingBlockPath(editor, startPath.path),
      getEnclosingBlockPath(editor, endPath.path)
    )) {
      const left = xs[0];
      const right = xs[1];
      if (left === undefined || right === undefined) {
        // difference in path length
        break;
      }

      if (left !== right) {
        // mismatch in path
        break;
      }

      enclosingPath.push(left);
    }

    return enclosingPath;
  }
};

export const moveOut = (editor: Editor) => {
  if (!editor.selection) {
    return;
  }
  // get largest enclosing section
  const largestEnclosingSection = getLargestEnclosingSection(
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

type StructuralBoxProps = {
  structureMode: StructureMode;
};

export const StructuralBox: FunctionComponent<StructuralBoxProps> = ({
  structureMode,
  children,
}) => {
  const divStyle = {
    borderLeftWidth: "thick",
    borderLeftColor: "gainsboro",
    borderLeftStyle: "solid",
    borderLeftRadius: "4px",
    padding: "4px",
    marginTop: "4px",
    marginBottom: "4px",
  };

  return (
    <div style={structureMode === "outline-mode" ? divStyle : {}}>
      {children}
    </div>
  );
};
