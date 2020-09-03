import {
  platformAwareKeymapToActiveKeymap,
  makeHotkeyHandler,
} from "./Hotkeys";
import { isKeyHotkey } from "is-hotkey";
import { PlatformAwareKeymap, Keymap } from "./Types";

import { noopKBEventHandler } from "./EventHandling";

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

test("conversion from platform aware keymap to active keymap works", () => {
  const platformAwareKeymap: PlatformAwareKeymap = {
    generic: {
      bold: ["alt+b", noopKBEventHandler()],
      italic: ["alt+i", noopKBEventHandler()],
    },
    platformSpecific: {
      apple: {
        redo: ["cmd+shift+z", noopKBEventHandler()],
      },
      windows: {},
    },
  };

  const activeKeymap: Keymap = platformAwareKeymapToActiveKeymap(
    platformAwareKeymap,
    "apple"
  );

  const expectedKeys = ["bold", "italic", "redo"];
  expect(new Set(Object.keys(activeKeymap))).toEqual(new Set(expectedKeys));
});

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

test("builds working hotkey handler", () => {
  const hb = jest.fn(noopKBEventHandler());
  const hi = jest.fn(noopKBEventHandler());
  const hr = jest.fn(noopKBEventHandler());
  const keymap: Keymap = {
    bold: ["alt+b", hb],
    italic: ["alt+i", hi],
    redo: ["cmd+shift+z", hr],
  };

  const hotkeyHandler = makeHotkeyHandler(keymap);

  const nonHotkeyKBEvent = new KeyboardEvent("keydown", e("b"));
  hotkeyHandler(nonHotkeyKBEvent);

  expect(hb.mock.calls.length).toBe(0);
  expect(hi.mock.calls.length).toBe(0);
  expect(hr.mock.calls.length).toBe(0);

  const testKBEvents = {
    bold: new KeyboardEvent("keydown", e("b", "alt")),
    italic: new KeyboardEvent("keydown", e("i", "alt")),
    redo: new KeyboardEvent("keydown", e("z", "meta", "shift")), // cmd is meta on Mac
  };

  for (let [_expectedCmdName, kbEvent] of Object.entries(testKBEvents)) {
    hotkeyHandler(kbEvent);
  }
  expect(hb.mock.calls.length).toBe(1);
  expect(hi.mock.calls.length).toBe(1);
  expect(hr.mock.calls.length).toBe(1);
});
