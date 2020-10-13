import React, { FunctionComponent } from "react";
import { Editor, Transforms } from "slate";
import { StructureMode } from "./Types";

export const denestSection = (editor: Editor) => {
  Transforms.unwrapNodes(editor, {
    match: (n) => {
      return "type" in n && n.type === "section";
    },
  });
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
