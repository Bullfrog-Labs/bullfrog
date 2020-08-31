import * as React from "react";
import {
  Document,
  ElementType,
  RenderElement,
  Text as TextNode,
} from "kmgmt-common";
import { Text } from "react-native-paper";

function renderText(textNode: TextNode) {
  return textNode.text;
}

function renderChildren(children: RenderElement[]) {
  return children.map((c) => render(c));
}

function render(node: RenderElement): React.ReactFragment {
  switch (node.type) {
    case ElementType.Paragraph:
      return <Text>{renderChildren(node.children)}</Text>;
    case ElementType.Text:
      return renderText(node);
    case ElementType.Document:
      return renderChildren(node.children);
  }
}

export function NotePreview(props: { document: Document }) {
  const { document } = props;
  return render(document);
}
