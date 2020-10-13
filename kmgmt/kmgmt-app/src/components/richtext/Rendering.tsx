import React, { FunctionComponent } from "react";
import { Typography } from "@material-ui/core";
import { RenderLeafProps, RenderElementProps } from "slate-react";
import { Section, SectionTitle } from "./Section";
import { StructureMode } from "./Types";

export type RichTextEditorElementProps = {
  structureMode: StructureMode;
  renderElementProps: RenderElementProps;
};

export type RichTextEditorLeafProps = {
  structureMode: StructureMode;
  renderLeafProps: RenderLeafProps;
};

type StructuralBoxProps = {
  structureMode: StructureMode;
};

const StructuralBox: FunctionComponent<StructuralBoxProps> = ({
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
        <StructuralBox structureMode={props.structureMode}>
          <blockquote {...attributes}>
            <Typography variant="body1">{children}</Typography>
          </blockquote>
        </StructuralBox>
      );
    case "bulleted-list":
      return (
        <StructuralBox structureMode={props.structureMode}>
          <ul {...attributes}>{children}</ul>{" "}
        </StructuralBox>
      );
    case "heading-1":
      return (
        <Typography variant="h2" {...attributes}>
          {children}
        </Typography>
      );
    case "heading-2":
      return (
        <Typography variant="h3" {...attributes}>
          {children}
        </Typography>
      );
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "numbered-list":
      return (
        <StructuralBox structureMode={props.structureMode}>
          {" "}
          <ol {...attributes}>{children}</ol>{" "}
        </StructuralBox>
      );
    default:
      return (
        <StructuralBox structureMode={props.structureMode}>
          <Typography variant="body1" paragraph={true} {...attributes}>
            {children}
          </Typography>
        </StructuralBox>
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
