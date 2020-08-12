// Adapted from
// https://github.com/ianstormtaylor/slate/blob/e766e7a4ac6dbdd2863a73012140d79ebe42743e/packages/slate-react/src/utils/hotkeys.ts
// under MIT license.

import { isKeyHotkey } from "is-hotkey";
import { IS_APPLE } from "./Environment";

// Hotkey mappings for each platform - this should be maintained to reflect what
// the RichTextEditor supports.

export type HotkeySpec = string | string[];
export type CommandNameToHotkey = { [commandName: string]: HotkeySpec };

const GENERIC_HOTKEYS: CommandNameToHotkey = {
  bold: "mod+b",
  compose: ["down", "left", "right", "up", "backspace", "enter"],
  moveBackward: "left",
  moveForward: "right",
  moveWordBackward: "ctrl+left",
  moveWordForward: "ctrl+right",
  deleteBackward: "shift?+backspace",
  deleteForward: "shift?+delete",
  extendBackward: "shift+left",
  extendForward: "shift+right",
  italic: "mod+i",
  splitBlock: "shift?+enter",
  undo: "mod+z",
};

const APPLE_HOTKEYS: CommandNameToHotkey = {
  moveLineBackward: "opt+up",
  moveLineForward: "opt+down",
  moveWordBackward: "opt+left",
  moveWordForward: "opt+right",
  deleteBackward: ["ctrl+backspace", "ctrl+h"],
  deleteForward: ["ctrl+delete", "ctrl+d"],
  deleteLineBackward: "cmd+shift?+backspace",
  deleteLineForward: ["cmd+shift?+delete", "ctrl+k"],
  deleteWordBackward: "opt+shift?+backspace",
  deleteWordForward: "opt+shift?+delete",
  extendLineBackward: "opt+shift+up",
  extendLineForward: "opt+shift+down",
  redo: "cmd+shift+z",
  transposeCharacter: "ctrl+t",
};

const WINDOWS_HOTKEYS: CommandNameToHotkey = {
  deleteWordBackward: "ctrl+shift?+backspace",
  deleteWordForward: "ctrl+shift?+delete",
  redo: ["ctrl+y", "ctrl+shift+z"],
};

export interface HotkeyMapping {
  generic: CommandNameToHotkey;
  apple: CommandNameToHotkey;
  windows: CommandNameToHotkey;
}

export const HOTKEY_MAPPING: HotkeyMapping = {
  generic: GENERIC_HOTKEYS,
  apple: APPLE_HOTKEYS,
  windows: WINDOWS_HOTKEYS,
};

function makeHotkeyMatcher(commandName: string, hkspec: HotkeySpec) {
  let checkKeyForHotkey = isKeyHotkey(hkspec);
  return (event: KeyboardEvent) =>
    checkKeyForHotkey(event) ? commandName : undefined;
}

function hotkeyMappingToActiveHotkeys(
  hotkeyMapping: HotkeyMapping,
  platform: string
) {
  let platformSpecificHotkeys;
  switch (platform) {
    case "apple":
      platformSpecificHotkeys = hotkeyMapping.apple;
      break;
    case "windows":
      platformSpecificHotkeys = hotkeyMapping.windows;
      break;
    default:
      throw new Error("invalid platform");
  }

  debugger;

  let activeHotkeys = { ...hotkeyMapping.generic, ...platformSpecificHotkeys };
  return activeHotkeys;
}

// Create platform-aware hotkey resolver.
export function makeHotkeyResolver(
  hotkeyMapping: HotkeyMapping,
  platform?: string | undefined
) {
  if (!platform) {
    platform = IS_APPLE ? "apple" : "windows";
  }

  let activeHotkeys = hotkeyMappingToActiveHotkeys(hotkeyMapping, platform);
  let hotkeyMatchers: ((
    e: KeyboardEvent
  ) => string | undefined)[] = Object.entries(
    activeHotkeys
  ).map(([commandName, hkspec]) => makeHotkeyMatcher(commandName, hkspec));

  return (event: KeyboardEvent) => {
    for (let matcher of hotkeyMatchers) {
      let result = matcher(event);
      if (result) {
        return result;
      }
    }
    return undefined;
  };
}
