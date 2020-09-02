import Slate from "slate";

/**
 * NOTE: Important to keep in mind that these types are a spec for a
 * persistent storage format. Non-backwards compatible changes should
 * never be made. In general:
 * 1. Never remove any field
 * 2. Add any new field as optional
 * 3. Don't add non-storage format related state or functionality
 */

/**
 * Just a trait to make it more clear that type property should always
 * exist in any node.
 */
export interface TypedNode {
  type: NodeType;
}

export enum NodeType {
  Paragraph = "paragraph",
  Document = "document",
  Text = "text",
}

/**
 * In kmgmt, all elements have a type field.
 */
export interface Element extends Slate.Element, TypedNode {}

export interface TextNode extends Slate.Text, TypedNode {
  bold?: boolean;
  underline?: boolean;
  italic?: boolean;
  type: NodeType.Text;
}

export interface ParagraphNode extends Element {
  type: NodeType.Paragraph;
  children: TextNode[];
}

export interface DocumentNode extends Element {
  type: NodeType.Document;
  children: BlockNode[];
}

/**
 * Any top-level block node.
 */
export type BlockNode = ParagraphNode;

/**
 * All nodes that need to be rendered. Using a union-type here makes it
 * easier to ensure we always handle each type because it supports a sort
 * of pattern matching.
 */
export type RenderNode = BlockNode | DocumentNode | TextNode;

/**
 * Helper functions for creating Nodes.
 */
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
  static fromTextObject(text: Object): TextNode {
    return text as TextNode;
  }
  static fromParagraphObject(paragraph: Object): ParagraphNode {
    return paragraph as ParagraphNode;
  }
}

/**
 * Helper functions for creating Documents.
 */
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
  static fromChildren(children: any): DocumentNode {
    const document = {
      children: children,
      type: NodeType.Document,
    };
    return Documents.fromObject(document);
  }
  static fromObject(document: Object): DocumentNode {
    return document as DocumentNode;
  }
}
