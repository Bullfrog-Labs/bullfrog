// Used for union type exhaustiveness checking, see
// https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html
export const assertNever: (x: never) => never = (x) => {
  throw new Error("Unexpected object: " + x);
};
