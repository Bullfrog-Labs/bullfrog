import * as React from "react";
import { DocumentNode, NodeType, RenderNode, TextNode } from "kmgmt-common";
import { Text } from "react-native-paper";

function renderText(textNode: TextNode) {
  return textNode.text;
}

function renderChildren(children: RenderNode[]) {
  return children.map((ch) => render(ch));
}

function render(node: RenderNode): React.ReactFragment {
  switch (node.type) {
    case NodeType.Paragraph: {
      const children = renderChildren(node.children);
      return <Text>{children}</Text>;
    }
    case NodeType.Text:
      return renderText(node);
    case NodeType.Document:
      return renderChildren(node.children);
  }
}

export function NotePreview(props: { document: DocumentNode }) {
  const { document } = props;
  return render(document);
}
