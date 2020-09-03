import { RichText } from "./Database";

export default class RichTextRenderer {
  /**
   * Really basic mobile note renderer which concatenates any paragraphs in the top level.
   * @param text
   */
  static renderTopLevelParagraphs(text: RichText): string {
    let result = "";
    text.forEach((node, i: number) => {
      if (node.children && Array.isArray(node.children)) {
        if (node.type === "paragraph") {
          if (node.children.length > 0) {
            if (i > 0) {
              result += "\n";
            }
            if (node.children[0].text) {
              result += node.children[0].text;
            }
          }
        }
      }
    });
    return result;
  }
}
