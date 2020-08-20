import RichTextRenderer from "./RichTextRenderer";

test("render empty RichText", () => {
  const result = RichTextRenderer.render([]);
  expect(result).toEqual("");
});

test("render RichText with paragraphs", () => {
  const result = RichTextRenderer.render([
    { type: "paragraph", children: [{ text: "p1" }] },
    { type: "paragraph", children: [{ text: "p2" }] },
  ]);
  expect(result).toEqual("p1\np2");
});
