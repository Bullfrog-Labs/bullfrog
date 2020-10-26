/** @jsx jsx */

import { createHyperscript } from "slate-hyperscript";
import { convertCurrentSelectionToSectionMode } from "./SelectionMode";
import { Descendant, Node } from "slate";

const jsx = createHyperscript({
  elements: {
    paragraph: { type: "paragraph" },
    section: { type: "section" },
  },
});

const areNodesEqual = (node: Node, otherNode: Node): boolean => {
  if (node.type !== otherNode.type) {
    return false;
  }

  if (node.selected !== otherNode.selected) {
    return false;
  }

  const nodeHasChildren = "children" in node && node.children !== undefined;
  const otherNodeHasChildren =
    "children" in otherNode && otherNode.children !== undefined;

  if (nodeHasChildren !== otherNodeHasChildren) {
    return false;
  }

  if (!nodeHasChildren) {
    return true;
  }

  const nodeChildren = node.children as Array<Descendant>;
  const otherNodeChildren = otherNode.children as Array<Descendant>;

  if (nodeChildren.length !== otherNodeChildren.length) {
    return false;
  }

  for (var i = 0; i < nodeChildren.length; i++) {
    if (!areNodesEqual(nodeChildren[i], otherNodeChildren[i])) {
      return false;
    }
  }

  return true;
};

test("convertCurrentSelectionToSectionMode works for single block", () => {
  const input = (
    <editor>
      <paragraph>
        <anchor />
        paragraph <focus />0
      </paragraph>
    </editor>
  );

  convertCurrentSelectionToSectionMode(input);

  const expected = (
    <editor>
      <paragraph selected={true}>paragraph 0</paragraph>
    </editor>
  );

  expect(areNodesEqual(input, expected)).toBeTruthy();
});

test("convertCurrentSelectionToSectionMode works for blocks on same level", () => {
  const input = (
    <editor>
      <section>
        <section>
          <paragraph>
            paragraph <anchor /> 0.0.0
          </paragraph>
        </section>
        <section>
          <paragraph>
            para
            <focus />
            graph 0.1.0
          </paragraph>
        </section>
      </section>
    </editor>
  );

  convertCurrentSelectionToSectionMode(input);

  const expected = (
    <editor>
      <section>
        <section selected={true}>
          <paragraph selected={true}>paragraph 0.0.0</paragraph>
        </section>
        <section selected={true}>
          <paragraph selected={true}>paragraph 0.1.0</paragraph>
        </section>
      </section>
    </editor>
  );

  expect(areNodesEqual(input, expected)).toBeTruthy();
});
