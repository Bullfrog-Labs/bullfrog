import { Typography, TypographyClassKey } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { Transforms } from "slate";
import { ReactEditor, RenderElementProps, useEditor } from "slate-react";
import { EditableTypography } from "./EditableTypography";

type SectionTitleProps = {
  level: number;
  title?: string;
};

const SectionTitle: FunctionComponent<SectionTitleProps> = ({
  level,
  title,
}) => {
  const editor = useEditor();
  const variant = `h${level + 1}`;

  const onChange = (newTitle: string) => {
    if (title === newTitle) {
      return;
    }

    Transforms.setNodes(
      editor,
      { title: newTitle },
      { match: (n) => n.type === "section" }
    );
  };

  return (
    <EditableTypography
      readOnly={false}
      variant={variant}
      initialValue={title}
      handleEscape={(event) => {
        ReactEditor.focus(editor);
      }}
      onChange={onChange}
    />
  );
};

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
  const max_level_for_block_style_section_title = 5;

  const title: string = (element.title as unknown) as string; // TODO: Is this the right way to do this?
  const level = path.length;

  const section_title =
    level <= max_level_for_block_style_section_title ? (
      <SectionTitle level={level} title={title} />
    ) : (
      <span>
        <strong>{title}</strong>{" "}
      </span>
    );
  return (
    <div style={divStyle} {...attributes}>
      {section_title}
      {children}
    </div>
  );
};
