import * as React from "react";
import * as log from "loglevel";
import { DocumentNode, NodeType, RenderNode, TextNode } from "kmgmt-common";
import { StyleSheet, View } from "react-native";
import { Text, Surface } from "react-native-paper";

const styles = StyleSheet.create({
  surface: {
    padding: 4,
    margin: 4,
    elevation: 1,
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
});

function renderText(textNode: TextNode) {
  return textNode.text;
}

function renderChildren(children: RenderNode[]) {
  return children.map((ch) => render(ch));
}

function render(node: RenderNode): React.ReactFragment {
  const logger = log.getLogger("NotePreview");
  logger.debug(`render ${node.type}`);
  switch (node.type) {
    case NodeType.Paragraph: {
      const children = renderChildren(node.children);
      return <Text>{children}</Text>;
    }
    case NodeType.Text:
      return renderText(node);
    case NodeType.Document: {
      const children = renderChildren(node.children);
      return children;
    }
  }
}

export function NotePreview(props: { document: DocumentNode }) {
  const logger = log.getLogger("NotePreview");
  const { document } = props;
  logger.debug(`rendering preview ${JSON.stringify(document)}`);
  const children = render(document);
  return (
    <Surface style={styles.surface}>
      <View style={styles.item}>{children}</View>
    </Surface>
  );
}
