import React, { FunctionComponent } from "react";
import { Editor, Range, Node, Transforms, Element } from "slate";
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
  const matches = Array.from(
    Editor.nodes(editor, {
      at: editor.selection,
      mode: "lowest",
      match: (n) => {
        if (Element.isElement(n) && n.type === "section") {
          const path = ReactEditor.findPath(editor, n);
          return path.length === 1;
        }
      },
    })
  );

  /*
  Transforms.unwrapNodes(editor, {
    mode: "lowest",
    match: (n) => {
      if (Element.isElement(n) && n.type === "section") {
        const path = ReactEditor.findPath(editor, n);
        return path.length === 1;
      }
    },
  });
  */

  // WTF: The match function seems to be run over every single parent node from
  // the selection, so that even the parent nodes have the operation performed
  // upon them.
  Transforms.liftNodes(editor, {
    mode: "lowest",
    match: (n) => {
      // need to denest from a section, so if there is no section, skip
      // denesting
      if (!isSectionActive(editor)) {
        return false;
      }

      if (!editor.selection) {
        return false;
      }

      const path = ReactEditor.findPath(editor, n);
      const includedInSelection = Range.includes(editor.selection, path);

      if (!includedInSelection) {
        return false;
      }

      // denesting on a section title means to denest the section itself
      if (isSectionTitleActive(editor)) {
        const result = "type" in n && n.type === "section";
        console.log(result, n);
        return result;
      } else {
        const result = Editor.isBlock(editor, n);
        console.log(result, n);
        return result;
      }
    },
  });

  // force normalize to fix section titles that would become top-level, if any
  Editor.normalize(editor, { force: true });
};
export const nestSection = (editor: Editor) => {
  // cases
  // 1. text selected
  // 2. no text selected
  // 3. ?
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
