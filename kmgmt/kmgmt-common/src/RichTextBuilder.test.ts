import RichTextBuilder from "./RichTextBuilder";

test("build empty RichText", () => {
  const builder = new RichTextBuilder();
  const result = builder.build();
  expect(result).toEqual([]);
});

test("build RichText with paragraphs", () => {
  let builder = new RichTextBuilder();
  builder.addParagraph("p1").addParagraph("p2");
  const result = builder.build();
  expect(result).toEqual([
    { type: "paragraph", children: [{ text: "p1" }] },
    { type: "paragraph", children: [{ text: "p2" }] },
  ]);
});
