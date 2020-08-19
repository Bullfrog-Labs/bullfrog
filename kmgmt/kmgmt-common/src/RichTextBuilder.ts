import { RichText } from "./Database";

export default class RichTextBuilder {
  note: RichText = [];
  addParagraph(text: string): RichTextBuilder {
    this.note.push({
      children: [{ text: text }],
      type: "paragraph",
    });
    return this;
  }
  build(): RichText {
    return this.note;
  }
}
