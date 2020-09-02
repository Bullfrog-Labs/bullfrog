import Slate from "slate";

export interface TypedNode {
  type: NodeType;
}

export enum NodeType {
  Paragraph = "paragraph",
  Document = "document",
  Text = "text",
}

export interface TextNode extends Slate.Text, TypedNode {
  bold?: boolean;
  underline?: boolean;
  italic?: boolean;
  type: NodeType.Text;
}

export interface Element extends Slate.Element, TypedNode {}

export interface ParagraphNode extends Element {
  type: NodeType.Paragraph;
  children: TextNode[];
}

export interface DocumentNode extends Element {
  type: NodeType.Document;
  children: BlockNode[];
}

export type BlockNode = ParagraphNode;
export type RenderNode = BlockNode | DocumentNode | TextNode;

export class Nodes {
  static document(elements: BlockNode[] | BlockNode): DocumentNode {
    let els = Array.isArray(elements) ? elements : [elements];
    return {
      type: NodeType.Document,
      children: els,
    };
  }
  static paragraph(text: TextNode): ParagraphNode {
    return {
      type: NodeType.Paragraph,
      children: [text],
    };
  }
  static text(text: string): TextNode {
    return {
      text: text,
      type: NodeType.Text,
    };
  }
}

export class Documents {
  static paragraph(content: string): DocumentNode {
    const text = Nodes.text(content);
    const paragraph = Nodes.paragraph(text);
    const document = Nodes.document(paragraph);
    return document;
  }
  static emptyParagraph(): DocumentNode {
    return Documents.paragraph("");
  }
  static appendParagraph(
    document: DocumentNode,
    paragraph: string
  ): DocumentNode {
    const text = Nodes.text(paragraph);
    const para = Nodes.paragraph(text);
    document.children.push(para);
    return document;
  }
}
