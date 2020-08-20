import { SimpleRichText } from "./Database";

export default class RichTextRenderer {
  static render(text: SimpleRichText): string {
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
