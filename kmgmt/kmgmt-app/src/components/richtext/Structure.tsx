import React, { FunctionComponent } from "react";
import {
  Editor,
  Range,
  Node,
  Transforms,
  Element,
  Text,
  Path,
  NodeEntry,
  Point,
} from "slate";
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

const getEnclosingBlockPathEntry = (editor: Editor, path: Path): NodeEntry => {
  const ancestors = Array.from(Node.ancestors(editor, path, { reverse: true }));
  for (const entry of ancestors) {
    const [ancestor, _] = entry;
    if (Element.isElement(ancestor)) {
      return entry;
    }
  }
  throw new Error("no blocks all the way to the root");
};

const getEnclosingSectionPathEntry = (
  editor: Editor,
  path: Path
): NodeEntry | null => {
  const ancestors = Array.from(Node.ancestors(editor, path, { reverse: true }));
  for (const entry of ancestors) {
    const [ancestor, _] = entry;
    if (Element.isElement(ancestor) && ancestor.type === "section") {
      return entry;
    }
  }
  return null;
};

const arePathsSame = (path: Path, otherPath: Path): boolean => {
  if (path.length !== otherPath.length) {
    return false;
  }

  const zipped = zip(path, otherPath);

  for (const [a, b] of zipped) {
    if (a !== b) {
      return false;
    }
  }

  return true;
};

const getSmallestEnclosingSection = (editor: Editor, range: Range): Path => {
  // Returns empty path [] to represent that the smallest enclosing section is
  // the top-level document.

  // TODO: consider how this would work with nested blocks. probably need to
  // check whether the block being returned is actually of type "section".

  // TODO: Change all of this to use getEnclosingSectionPathEntry instead.

  // TODO: Can this be simplified based on the fact that Path.compare returns
  // true when one path is the prefix of the other? It should be possible to
  // just find the common prefix of the path and go one up from that.

  const [startPath, endPath] = Range.edges(range).map((p) => {
    const [node, path] = getEnclosingBlockPathEntry(editor, p.path);
    return path;
  });
  // const samePaths = Path.compare(startPath, endPath) === 0;
  const samePaths = arePathsSame(startPath, endPath);

  if (samePaths) {
    // the largest enclosing section is the one directly up from the block.
    // return the parent block, which we assume is a section or the top-level
    // document.
    const [, path] = getEnclosingBlockPathEntry(
      editor,
      Range.start(range).path
    );

    return path.slice(0, -1);
  } else {
    // walk both start and end paths until there's a mismatch.
    const [startPath, endPath] = Range.edges(range);
    const [, startEnclosingBlockPath] = getEnclosingBlockPathEntry(
      editor,
      startPath.path
    );
    const [, endEnclosingBlockPath] = getEnclosingBlockPathEntry(
      editor,
      endPath.path
    );

    const enclosingPath: number[] = [];

    for (const xs of zip(startEnclosingBlockPath, endEnclosingBlockPath)) {
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

const rangeSpansAcrossBlocks = (editor: Editor, range: Range): boolean => {
  const [startPath, endPath] = Range.edges(range).map((p) => {
    const entry = getEnclosingBlockPathEntry(editor, p.path);
    if (entry === null) {
      throw new Error(
        "All content should be enclosed in blocks, but this one is not."
      );
    }
    const [_node, path] = entry;
    return path;
  });

  const result = !arePathsSame(startPath, endPath);
  console.log({ startPath: startPath, endPath: endPath, result: result });
  return result;
};

const rangeSpansAcrossSections = (editor: Editor, range: Range): boolean => {
  const [startPath, endPath] = Range.edges(range).map((p) => {
    const entry = getEnclosingSectionPathEntry(editor, p.path);
    if (entry === null) {
      return null;
    }
    const [_node, path] = entry;
    return path;
  });

  if (startPath === null && endPath === null) {
    // neither endpoint is within a section - are there any sections between them?
    const [startPath, endPath] = Range.edges(range).map((p) => p.path);
    const sections = Node.elements(editor, {
      from: startPath,
      to: endPath,
      pass: (entry: NodeEntry) => {
        const [node, _path] = entry;
        return node.type !== "section";
      },
    });

    // TODO: this check for iterater being non-empty can be made faster. It currently realizes all the elements.
    return Array.from(sections).length > 0;
  } else if (startPath !== null && endPath !== null) {
    // if both endpoints are not in the same section, then the range spans across sections
    return !arePathsSame(startPath, endPath);
  } else {
    // one endpoint is within a section and the other is not. therefore, the
    // selection spans across sections.
    return true;
  }
};

const expandSelectionToCoverSections = (editor: Editor) => {
  if (!editor.selection) {
    return;
  }

  const [startSectionPath, endSectionPath] = Range.edges(editor.selection).map(
    (p) => {
      const result = getEnclosingSectionPathEntry(editor, p.path);
      if (result === null) {
        return null;
      }
      const [_node, path] = result;
      return path;
    }
  );

  const startPoint = {
    path:
      startSectionPath === null
        ? Range.start(editor.selection).path // start not contained in section
        : startSectionPath,
    offset: 0,
  };

  const endPath =
    endSectionPath === null ? Range.end(editor.selection).path : endSectionPath;
  const pointPastEnd = {
    path: Path.next(endPath), // TODO: how's this supposed to work for the last node?
    offset: 0,
  };

  console.log(startPoint);
  console.log(pointPastEnd);

  // cannot set point to a place where there is no corresponding DOM node
  Transforms.setPoint(editor, startPoint, { edge: "start" });
  // Transforms.setPoint(editor, pointPastEnd, { edge: "end" });

  // Move back to end of section
  // Transforms.move(editor, { distance: 1, unit: "offset", edge: "end" });
};

export const handleSelectionChange = (
  editor: Editor,
  sectionModeEnabled: boolean,
  setSectionModeEnabled: (sectionModeEnabled: boolean) => void
) => {
  if (!editor.selection) {
    return;
  }

  if (rangeSpansAcrossBlocks(editor, editor.selection)) {
    // if the selection spans multiple sections, switch to section mode.
    // TODO: is there any logic to be done when switching in, beyond setting the flag?
    if (!sectionModeEnabled) {
      setSectionModeEnabled(true);
    }
    // move anchor and focus to cover the sections, if they are not in the middle of the section

    expandSelectionToCoverSections(editor);
    // mark sections as selected
    // WTFNOTE: how to get the sections?
  } else {
    // if the selection spans is in a single section, switch out of section mode.
    // TODO: is there any logic to be done when switching out, beyond setting the flag?
    if (sectionModeEnabled) {
      setSectionModeEnabled(false);
    }
  }

  // if in section mode, ensure that the appropriate sections are marked as
  // selected, and that those sections are clearly delinenated as selected.

  // if in section mode, and the focus is in the middle of a section, move it to
  // cover the entire section.
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
