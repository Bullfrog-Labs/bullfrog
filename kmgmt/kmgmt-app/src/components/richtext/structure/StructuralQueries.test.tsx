/** @jsx jsx */

import { createHyperscript } from "slate-hyperscript";
import {
  rangeSpansAcrossBlocks,
  rangeToSpannedBlockPaths,
} from "./StructuralQueries";

const jsx = createHyperscript({
  elements: {
    paragraph: { type: "paragraph" },
    section: { type: "section" },
  },
});

const input = (
  <editor>
    <paragraph>paragraph 0</paragraph>
    <section>
      <paragraph>paragraph 1.0</paragraph>
      <paragraph>paragraph 1.1</paragraph>
      <paragraph>paragraph 1.2</paragraph>
    </section>
  </editor>
);

const singleBlockRange = {
  anchor: { path: [1, 0, 0], offset: 0 },
  focus: { path: [1, 0, 0], offset: 10 },
};

const rangeSpanningBlocksOnSameLevel = (a: number, b: number) => ({
  anchor: { path: [1, a, 0], offset: 0 },
  focus: { path: [1, b, 0], offset: 10 },
});

test("rangeSpansAcrossBlocks for range within a single block", () => {
  const result = rangeSpansAcrossBlocks(input, singleBlockRange);
  expect(result).toBeFalsy();
});

test("rangeSpansAcrossBlocks for range spanning blocks on the same level", () => {
  const tests = [
    [0, 1],
    [1, 2],
    [0, 2],
  ];

  for (const test of tests) {
    const [a, b] = test;
    const result = rangeSpansAcrossBlocks(
      input,
      rangeSpanningBlocksOnSameLevel(a, b)
    );
    expect(result).toBeTruthy();
  }
});

test("rangeSpansAcrossBlocks for range spanning blocks on different levels", () => {
  const blockPaths = [[0], [1, 1]];

  const result = rangeToSpannedBlockPaths(input, {
    anchor: { path: blockPaths[0].concat([0]), offset: 0 },
    focus: { path: blockPaths[1].concat([0]), offset: 10 },
  });

  expect(result).toBeTruthy();
});

test("rangeToSpannedBlockPaths within a single block", () => {
  const result = rangeToSpannedBlockPaths(input, singleBlockRange);
  const expected = [[1, 0]];

  expect(result).toStrictEqual(expected);
});

test("rangeToSpannedBlockPaths for range spanning blocks on the same level", () => {
  const tests = [
    { endpoints: [0, 1], expected: [0, 1] },
    { endpoints: [1, 2], expected: [1, 2] },
    { endpoints: [0, 2], expected: [0, 1, 2] },
  ];

  for (const test of tests) {
    const { endpoints, expected } = test;
    const [a, b] = endpoints;
    const result = rangeToSpannedBlockPaths(
      input,
      rangeSpanningBlocksOnSameLevel(a, b)
    );

    const expectedFullPaths = expected.map((x) => [1].concat(x));

    expect(result).toStrictEqual(expectedFullPaths);
  }
});

test("rangeToSpannedBlockPaths for range spanning blocks on different levels", () => {
  const blockPaths = [[0], [1, 1]];

  const result = rangeToSpannedBlockPaths(input, {
    anchor: { path: blockPaths[0].concat([0]), offset: 0 },
    focus: { path: blockPaths[1].concat([0]), offset: 10 },
  });
  const expected = [[0], [1]];

  expect(result).toStrictEqual(expected);
});
