import { RichText, Element, Node, Text } from "./Database";

export default class RichTextRenderer {
  /**
   * Really basic mobile note renderer which concatenates any paragraphs in the top level.
   * @param text
   */
  static renderTopLevelParagraphs(text: RichText): string {
    let result = "";
    text.forEach((node: Element | Text, i: number) => {
      if ("children" in node) {
        if (node.type === "paragraph") {
          if (node.children.length > 0) {
            if (i > 0) {
              result += "\n";
            }
            if ("text" in node.children[0]) {
              result += node.children[0].text;
            }
          }
        }
      }
    });
    return result;
  }
}
