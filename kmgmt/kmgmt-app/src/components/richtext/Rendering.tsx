import React, { FunctionComponent } from "react";
import { Typography } from "@material-ui/core";
import { RenderLeafProps, RenderElementProps } from "slate-react";
import { SectionTitle } from "./Section";
import { StructureMode } from "./Types";
import { StructuralBox } from "./Structure";

export type RichTextEditorElementProps = {
  structureMode: StructureMode;
  renderElementProps: RenderElementProps;
};

export type RichTextEditorLeafProps = {
  structureMode: StructureMode;
  renderLeafProps: RenderLeafProps;
};

export const Element: FunctionComponent<RichTextEditorElementProps> = (
  props
) => {
  const { attributes, children, element } = props.renderElementProps;

  switch (element.type) {
    case "section":
      return (
        <StructuralBox structureMode={props.structureMode}>
          {props.renderElementProps.children}
        </StructuralBox>
      );
    case "section-title":
      return <SectionTitle {...props.renderElementProps} />;
    case "block-quote":
      return (
        <blockquote {...attributes}>
          <Typography variant="body1">{children}</Typography>
        </blockquote>
      );
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>;
    default:
      return (
        <Typography variant="body1" paragraph={true} {...attributes}>
          {children}
        </Typography>
      );
  }
};

export const Leaf: FunctionComponent<RichTextEditorLeafProps> = (props) => {
  const { attributes, leaf } = props.renderLeafProps;
  var { children } = props.renderLeafProps;

  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.code) {
    children = <code>{children}</code>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  return <span {...attributes}>{children}</span>;
};
