import { makeStyles, Typography } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { Editor, Node, Element, Transforms } from "slate";
import {
  ReactEditor,
  RenderElementProps,
  useEditor,
  useFocused,
  useSelected,
} from "slate-react";
import { isSectionTitleActive } from "./Structure";

const useStyles = makeStyles((theme) => ({
  emptySectionTitle: {
    "& br": {
      display: "none", // Slate adds a <br> for empty leaves
    },
    "& .selected::after": {
      color: theme.palette.text.secondary,
      pointerEvents: "none",
      content: `"Add a section title"`,
    },
  },
}));

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

export const SectionTitle: FunctionComponent<RenderElementProps> = ({
  attributes,
  children,
  element,
}) => {
  const classes = useStyles();

  const editor = useEditor();
  const path = ReactEditor.findPath(editor, element);
  const level = path.length;
  const max_level_for_block_style_section_title = 5;

  const variant =
    level <= max_level_for_block_style_section_title
      ? `h${level - 1}`
      : "body1";

  const isEmpty = Node.string(element) === "";

  const selected = useSelected();
  const focused = useFocused();

  if (selected && focused) {
    children = <div className="selected">{children}</div>;
  }

  return (
    <Typography
      className={isEmpty ? classes.emptySectionTitle : ""}
      variant={variant}
      {...attributes}
    >
      {children}
    </Typography>
  );
};
