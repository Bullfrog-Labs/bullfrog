import { HotkeyMapping, makeHotkeyResolver } from "./Hotkeys";
import { isKeyHotkey, isHotkey } from "is-hotkey";

// utils taken from
// https://github.com/ianstormtaylor/is-hotkey/blob/master/test/index.js under
// MIT license.
function e(value: number | string, ...modifiers: string[]) {
  return {
    which: typeof value == "number" ? value : value.charCodeAt(0),
    key: typeof value == "string" ? value : String.fromCharCode(value),
    altKey: modifiers.includes("alt"),
    ctrlKey: modifiers.includes("ctrl"),
    metaKey: modifiers.includes("meta"),
    shiftKey: modifiers.includes("shift"),
  };
}

test("mod alias does not work in headless test env", () => {
  // WARNING: IS_MAC in
  // https://github.com/ianstormtaylor/is-hotkey/blob/master/src/index.js relies
  // on a browser environment, which means that the 'mod' alias (which maps to
  // 'meta' on Mac) in a headless test environment. Do not use this alias in the
  // below tests.

  const event = new KeyboardEvent("keydown", e("i", "meta"));
  const matcher = isKeyHotkey("mod+i");
  expect(matcher(event)).toBeFalsy();
});

test("builds working hotkey resolver", () => {
  const hotkeyMapping: HotkeyMapping = {
    generic: {
      bold: "alt+b",
      italic: "alt+i",
    },
    apple: {
      redo: "cmd+shift+z",
    },
    windows: {},
  };

  const testKBEvents = {
    italic: new KeyboardEvent("keydown", e("i", "alt")),
    bold: new KeyboardEvent("keydown", e("b", "alt")),
    redo: new KeyboardEvent("keydown", e("z", "meta", "shift")), // cmd is meta on Mac
  };

  const hotkeyResolver = makeHotkeyResolver(hotkeyMapping, "apple");

  for (let [expectedCmdName, kbEvent] of Object.entries(testKBEvents)) {
    expect(hotkeyResolver(kbEvent)).toEqual(expectedCmdName);
  }
});
