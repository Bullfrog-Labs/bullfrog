import * as React from "react";
import * as log from "loglevel";
import * as Slate from "slate";
import { DocumentNode, TypedElement } from "kmgmt-common";
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

type RenderElementFn = (
  element: TypedElement,
  children: JSX.Element[]
) => JSX.Element;
type RenderLeafFn = (text: Slate.Text) => JSX.Element;

function SlateDocument(props: {
  node: Slate.Node;
  renderElement: RenderElementFn;
  renderLeaf: RenderLeafFn;
}): JSX.Element {
  const { node, renderElement, renderLeaf } = props;
  if (TypedElement.isTypedElement(node)) {
    const children = node.children.map((c: Slate.Node) => {
      return (
        <SlateDocument
          node={c}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
        />
      );
    });
    if (!node.type) {
      throw new Error(`Element ${node} is missing type`);
    }
    return renderElement(node as TypedElement, children);
  } else {
    return renderLeaf(node as Slate.Text);
  }
}

function renderElement(
  element: TypedElement,
  children: JSX.Element[]
): JSX.Element {
  const logger = log.getLogger("NotePreview");
  switch (element.type) {
    case "paragraph":
      return <Text>{children}</Text>;
    case "document": {
      return (
        <Surface style={styles.surface}>
          <View style={styles.item}>{children}</View>
        </Surface>
      );
    }
    default: {
      logger.warn(`Unhandled element, ignoring; type=${element.type}`);
      return <React.Fragment />;
    }
  }
}

function renderLeaf(text: Slate.Text): JSX.Element {
  return <React.Fragment>{text.text}</React.Fragment>;
}

export function NotePreview(props: { document: DocumentNode }) {
  const logger = log.getLogger("NotePreview");
  const { document } = props;
  logger.debug(`rendering preview ${JSON.stringify(document)}`);
  return (
    <SlateDocument
      node={document}
      renderElement={renderElement}
      renderLeaf={renderLeaf}
    />
  );
}
