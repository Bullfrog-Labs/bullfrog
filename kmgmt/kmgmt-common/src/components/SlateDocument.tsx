import * as React from "react";
import * as Slate from "slate";
import * as log from "loglevel";
import { TypedElement } from "../Document";

export type RenderElementFn = (
  element: TypedElement,
  children: JSX.Element[]
) => JSX.Element;

export type RenderLeafFn = (text: Slate.Text) => JSX.Element;

export function SlateDocument(props: {
  node: Slate.Node;
  renderElement: RenderElementFn;
  renderLeaf: RenderLeafFn;
}): JSX.Element {
  const logger = log.getLogger("NotePreview");
  const { node, renderElement, renderLeaf } = props;
  if (TypedElement.isTypedElement(node)) {
    const children = node.children.map((c: Slate.Node) => {
      logger.debug(`Render child; type=${c}, ptype=${node.type}`);
      // Force eager render. The test fails without this. Would like to
      // understand why...
      return SlateDocument({
        node: c,
        renderElement: renderElement,
        renderLeaf: renderLeaf,
      });
    });
    return renderElement(node, children);
  } else if (Slate.Text.isText(node)) {
    return renderLeaf(node as Slate.Text);
  } else {
    logger.error(`Invalid element, ignoring; type=${JSON.stringify(node)}`);
    return <React.Fragment />;
  }
}
