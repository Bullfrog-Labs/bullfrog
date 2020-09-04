import * as React from "react";
import * as log from "loglevel";
import * as Slate from "slate";
import { DocumentNode, TypedElement, SlateDocument } from "kmgmt-common";
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

function renderElement(
  element: TypedElement,
  children: JSX.Element[]
): JSX.Element {
  const logger = log.getLogger("NotePreview");
  logger.debug(`Render element; type=${element.type}`);
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
    case "block-quote":
    case "bulleted-list":
    case "heading-1":
    case "heading-2":
    case "list-item":
    case "numbered-list":
      logger.info(`type=${element.type} is not supported in this component`);
      return <React.Fragment />;
  }
}

function renderLeaf(text: Slate.Text): JSX.Element {
  const logger = log.getLogger("NotePreview");
  logger.debug(`Render text; text=${text.text}`);
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
