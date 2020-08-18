import { formatLogLine } from "./Logging";

test("formats log line", () => {
  expect(formatLogLine("DEBUG", "bar", "baz")).toEqual("DEBUG : bar : baz");
});
