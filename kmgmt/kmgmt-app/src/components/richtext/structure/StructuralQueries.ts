import { Editor, Range, Path, Node, Element, NodeEntry } from "slate";

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

const getEnclosingBlockPathEntry = (editor: Editor, path: Path): NodeEntry => {
  const ancestors = Array.from(Node.ancestors(editor, path, { reverse: true }));
  for (const entry of ancestors) {
    const [ancestor] = entry;
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
    const [ancestor] = entry;
    if (Element.isElement(ancestor) && ancestor.type === "section") {
      return entry;
    }
  }
  return null;
};

const zip = <T extends unknown>(arr1: T[], arr2: T[]): Array<T[]> =>
  arr1.map((k, i) => [k, arr2[i]]);

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

export const getSmallestEnclosingSection = (
  editor: Editor,
  range: Range
): Path => {
  // Returns empty path [] to represent that the smallest enclosing section is
  // the top-level document.

  // TODO: consider how this would work with nested blocks. probably need to
  // check whether the block being returned is actually of type "section".

  // TODO: Change all of this to use getEnclosingSectionPathEntry instead.

  // TODO: Can this be simplified based on the fact that Path.compare returns
  // true when one path is the prefix of the other? It should be possible to
  // just find the common prefix of the path and go one up from that.

  const [startPath, endPath] = Range.edges(range).map((p) => {
    const [, path] = getEnclosingBlockPathEntry(editor, p.path);
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

export const rangeSpansAcrossBlocks = (
  editor: Editor,
  range: Range
): boolean => {
  const [startPath, endPath] = Range.edges(range).map((p) => {
    const entry = getEnclosingBlockPathEntry(editor, p.path);
    if (entry === null) {
      throw new Error(
        "All content should be enclosed in blocks, but this one is not."
      );
    }
    const [, path] = entry;
    return path;
  });

  return !arePathsSame(startPath, endPath);
};

export const rangeToSpannedBlockPaths = (
  editor: Editor,
  range: Range
): Path[] => {
  const [startEntry, endEntry] = Range.edges(range).map((p) => {
    return getEnclosingBlockPathEntry(editor, p.path);
  });

  // Find the common depth for the paths
  const [, startPath] = startEntry;
  const [, endPath] = endEntry;

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
