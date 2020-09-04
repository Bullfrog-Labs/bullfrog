import * as Slate from "slate";
import isPlainObject from "is-plain-object";

/**
 * NOTE: Important to keep in mind that these types are a spec for a
 * persistent storage format. Non-backwards compatible changes should
 * never be made. In general:
 * 1. Never remove any field
 * 2. Add any new field as optional
 * 3. Don't add non-storage format related state or functionality
 */

export const ElementTypes = [
  "paragraph",
  "document",
  // Below here, not currently supported.
  "block-quote",
  "bulleted-list",
  "heading-1",
  "heading-2",
  "list-item",
  "numbered-list",
] as const;
export type ElementType = typeof ElementTypes[number];

/**
 * Just a trait to make it more clear that type property should always
 * exist in any node.
 */
export interface TypedElement extends Slate.Element {
  type: ElementType;
}

export const TypedElement = {
  isTypedElement(value: any): value is TypedElement {
    return (
      isPlainObject(value) &&
      value.type &&
      ElementTypes.indexOf(value.type) > -1 &&
      Slate.Element.isElement(value)
    );
  },
};

/**
 * In kmgmt, all elements have a type field.
 */
export interface Element extends Slate.Element, TypedElement {}

export interface ParagraphNode extends Element {
  type: "paragraph";
}

export interface DocumentNode extends Element {
  type: "document";
}

/**
 * Helper functions for creating Nodes. Mostly just used for tests, and some corner cases.
 */
export class Nodes {
  static document(elements: Element[] | Element): DocumentNode {
    let els = Array.isArray(elements) ? elements : [elements];
    return {
      type: "document",
      children: els,
    };
  }
  static paragraph(text: Slate.Text): ParagraphNode {
    return {
      type: "paragraph",
      children: [text],
    };
  }
  static text(text: string): Slate.Text {
    return {
      text: text,
    };
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
      type: "document",
    };
    return Documents.fromObject(document);
  }
  static fromObject(document: Object): DocumentNode {
    return document as DocumentNode;
  }
}
