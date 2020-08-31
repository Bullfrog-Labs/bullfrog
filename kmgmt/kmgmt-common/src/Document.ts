import { Text as SlateText, Element as SlateElement } from "slate";
import { Block } from "typescript";

export interface TypedNode {
  type: ElementType;
}

// todo: -> NodeType
export enum ElementType {
  Paragraph = "paragraph",
  Document = "document",
  Text = "text",
}

export interface Text extends SlateText, TypedNode {
  bold?: boolean;
  underline?: boolean;
  italic?: boolean;
  type: ElementType.Text;
}

export interface Element extends SlateElement, TypedNode {}

export interface Paragraph extends Element {
  type: ElementType.Paragraph;
  children: Text[];
}

export interface Document extends Element {
  type: ElementType.Document;
  children: BlockElement[];
}

export type BlockElement = Paragraph;
export type RenderElement = BlockElement | Document | Text;

export class Nodes {
  static document(elements: BlockElement[] | BlockElement): Document {
    let els = Array.isArray(elements) ? elements : [elements];
    return {
      type: ElementType.Document,
      children: els,
    };
  }
  static paragraph(text: Text): Paragraph {
    return {
      type: ElementType.Paragraph,
      children: [text],
    };
  }
  static text(text: string): Text {
    return {
      text: text,
      type: ElementType.Text,
    };
  }
}

export class Documents {
  static paragraph(content: string): Document {
    const text = Nodes.text(content);
    const paragraph = Nodes.paragraph(text);
    const document = Nodes.document(paragraph);
    return document;
  }
  static emptyParagraph(): Document {
    return Documents.paragraph("");
  }
  static appendParagraph(document: Document, paragraph: string): Document {
    const text = Nodes.text(paragraph);
    const para = Nodes.paragraph(text);
    document.children.push(para);
    return document;
  }
}
