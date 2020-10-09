import React, { FunctionComponent } from "react";
import { ReactEditor, RenderElementProps, useEditor } from "slate-react";

export const Section: FunctionComponent<RenderElementProps> = ({
  attributes,
  children,
  element,
}) => {
  const editor = useEditor();
  const path = ReactEditor.findPath(editor, element);
  const divStyle = {
    borderLeftWidth: "thick",
    borderLeftColor: "gainsboro",
    borderLeftStyle: "solid",
    borderLeftRadius: "4px",
    padding: "4px",
  };
  return (
    <div style={divStyle} {...attributes}>
      <span>
        <strong>{path.length}</strong>
      </span>
      {children}
    </div>
  );
};
