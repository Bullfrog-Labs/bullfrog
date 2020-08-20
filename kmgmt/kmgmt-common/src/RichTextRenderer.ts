import { SimpleRichText } from "./Database";

export default class RichTextRenderer {
  /**
   * Really basic mobile note renderer which concatenates any paragraphs in the top level.
   * @param text
   */
  static renderTopLevelParagraphs(text: SimpleRichText): string {
    let result = "";
    text.forEach((node, i) => {
      if (node.type === "paragraph") {
        if (node.children.length > 0) {
          if (i > 0) {
            result += "\n";
          }
          result += node.children[0].text;
        }
      }
    });
    return result;
  }
}
