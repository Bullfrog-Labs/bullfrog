import { makeStyles } from "@material-ui/core";
import { Transform } from "@material-ui/icons";
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

const getEnclosingPath = (path: Path, otherPath: Path): Path => {
  const enclosingPath: number[] = [];

  for (const xs of zip(path, otherPath)) {
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

    return getEnclosingPath(startEnclosingBlockPath, endEnclosingBlockPath);
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

  return !arePathsSame(startPath, endPath);
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

const first = <T extends unknown>(iter: Iterable<T>): T | null => {
  for (const x of iter) {
    return x;
  }

  return null;
};

const elementPathsToSelectionPoints = (
  editor: Editor,
  startElementPath: Path,
  endElementPath: Path
): [Point, Point] => {
  const [_startNode, startPath] = first(
    Node.texts(Node.get(editor, startElementPath), {})
  );

  const startPoint = {
    path: startElementPath.concat(startPath),
    offset: 0,
  };

  const [endNode, endPath] = first(
    Node.texts(Node.get(editor, endElementPath), { reverse: true })
  );
  const endPoint = {
    path: endElementPath.concat(endPath),
    offset: endNode.text.length,
  };

  return [startPoint, endPoint];
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

  const startElementPath =
    startSectionPath === null
      ? Range.start(editor.selection).path // start not contained in section
      : startSectionPath;

  const endElementPath =
    endSectionPath === null ? Range.end(editor.selection).path : endSectionPath;

  const [startPoint, endPoint] = elementPathsToSelectionPoints(
    editor,
    startElementPath,
    endElementPath
  );

  Transforms.setPoint(editor, startPoint, { edge: "start" });
  Transforms.setPoint(editor, endPoint, { edge: "end" });
};

const rangeToSpannedBlockPaths = (editor: Editor, range: Range): Path[] => {
  const [startEntry, endEntry] = Range.edges(range).map((p) => {
    return getEnclosingBlockPathEntry(editor, p.path);
  });

  // Find the common depth for the paths
  const [startNode, startPath] = startEntry;
  const [endNode, endPath] = endEntry;

  const spanDepth = getEnclosingPath(startPath, endPath).length + 1;

  const startSpanPath = startPath.slice(0, spanDepth);
  const endSpanPath = endPath.slice(0, spanDepth);
  const parentPath = startSpanPath.slice(0, -1);

  const spanBlockPaths = [];

  for (let i = startSpanPath.slice(-1)[0]; i <= endSpanPath.slice(-1)[0]; i++) {
    const path = parentPath.slice();
    path.push(i);
    spanBlockPaths.push(path);
  }

  // Return blocks at that level spanned by range
  return spanBlockPaths;
};

const convertCurrentSelectionToSectionMode = (editor: Editor) => {
  if (!editor.selection) {
    throw new Error("cannot convert null selection to section mode");
  }

  const spannedBlockPaths = rangeToSpannedBlockPaths(editor, editor.selection);

  for (const path of spannedBlockPaths) {
    Transforms.setNodes(editor, { selected: true }, { at: path });

    const node = Node.get(editor, path);
    for (const [_childNode, childPath] of Node.elements(node)) {
      Transforms.setNodes(
        editor,
        { selected: true },
        { at: path.concat(childPath) }
      );
    }
  }
};

const enableSectionMode = (editor: Editor) => {
  if (!editor.selection) {
    throw new Error("cannot enable section mode with null selection");
  }

  // move anchor and focus to cover the sections, if they are not in the middle of the section
  // expandSelectionToCoverSections(editor);

  // mark blocks under selection as selected
  convertCurrentSelectionToSectionMode(editor);

  // TODO: unset editor selection?
  // Transforms.deselect(editor);
};

const disableSectionMode = (editor: Editor) => {
  Transforms.unsetNodes(editor, "selected", {
    mode: "all",
    at: [],
    match: (n) => true,
  });
};

export const handleSelectionChange = (
  editor: Editor,
  sectionModeEnabled: boolean,
  setSectionModeEnabled: (sectionModeEnabled: boolean) => void
) => {
  if (!editor.selection) {
    return;
  }

  // TODO: Handle when selection mode is already enabled and the user is trying to change the selection mode, e.g. change selection by sections.
  // TODO: Handle switching out of selection mode when a single selection is chosen, and the user makes the selection smaller (so that it no longer spans blocks)

  if (rangeSpansAcrossBlocks(editor, editor.selection)) {
    // if the selection spans multiple sections, switch to section mode.
    // TODO: is there any logic to be done when switching in, beyond setting the flag?
    if (!sectionModeEnabled) {
      setSectionModeEnabled(true);
      enableSectionMode(editor);
    }
    // mark sections as selected
    // WTFNOTE: how to get the sections?
  } else {
    // if the selection spans is in a single section, switch out of section mode.
    if (sectionModeEnabled) {
      setSectionModeEnabled(false);
      disableSectionMode(editor);
    }
  }

  // if in section mode, ensure that the appropriate sections are marked as
  // selected, and that those sections are clearly delinenated as selected.

  // if in section mode, and the focus is in the middle of a section, move it to
  // cover the entire section.
};

const useStyles = makeStyles((theme) => ({
  structureBoxOutline: {
    borderLeftWidth: "thick",
    borderLeftColor: (props: StructuralBoxProps) =>
      props.selected ? "#07BEB8" : "gainsboro",
    borderLeftStyle: "solid",
    borderLeftRadius: "4px",
    padding: "4px",
    marginTop: "4px",
    marginBottom: "4px",
  },
  structureBox: {},
}));

type StructuralBoxProps = {
  structureMode: StructureMode;
  selected: boolean;
};

export const StructuralBox: FunctionComponent<StructuralBoxProps> = (props) => {
  const { structureMode, children } = props;
  const classes = useStyles(props);

  const className =
    structureMode === "outline-mode"
      ? classes.structureBoxOutline
      : classes.structureBox;

  return <div className={className}>{children}</div>;
};
