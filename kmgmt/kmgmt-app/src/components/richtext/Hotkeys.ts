// Adapted from
// https://github.com/ianstormtaylor/slate/blob/e766e7a4ac6dbdd2863a73012140d79ebe42743e/packages/slate-react/src/utils/hotkeys.ts
// under MIT license.

import * as log from "loglevel";
import { isKeyHotkey } from "is-hotkey";
import { IS_APPLE } from "./Environment";
import { PlatformAwareKeymap, Platform, KBEventHandler, Keymap } from "./Types";

export function platformAwareKeymapToActiveKeymap(
  platformAwareKeymap: PlatformAwareKeymap,
  platform: Platform
): Keymap {
  let platformSpecificHotkeys;
  switch (platform) {
    case "apple":
      platformSpecificHotkeys = platformAwareKeymap.platformSpecific.apple;
      break;
    case "windows":
      platformSpecificHotkeys = platformAwareKeymap.platformSpecific.windows;
      break;
    default:
      throw new Error("invalid platform");
  }

  let activeHotkeys = {
    ...platformAwareKeymap.generic,
    ...platformSpecificHotkeys,
  };

  return activeHotkeys;
}

type HotkeyMatcher = (event: KeyboardEvent) => boolean;

export function makeHotkeyHandler(activeKeymap: Keymap): KBEventHandler {
  let matcherHandlers: [
    string,
    HotkeyMatcher,
    KBEventHandler
  ][] = Object.entries(activeKeymap).map(([commandName, keymapEntry]) => {
    let [hotkeySpec, kbEventHandler] = keymapEntry;
    let hotkeyMatcher = isKeyHotkey(hotkeySpec);

    return [commandName, hotkeyMatcher, kbEventHandler];
  });

  const logger = log.getLogger("HotkeyHandler");

  return (event: KeyboardEvent) => {
    for (let [commandName, matcher, handler] of matcherHandlers) {
      if (matcher(event)) {
        logger.info(`Matched ${commandName}`);
        handler(event);
      }
    }
  };
}

export function platformAwareKeymapToHotkeyHandler(
  platformAwareKeymap: PlatformAwareKeymap,
  platform: Platform
): KBEventHandler {
  if (!platform) {
    platform = IS_APPLE ? "apple" : "windows";
  }

  let activeHotkeys = platformAwareKeymapToActiveKeymap(
    platformAwareKeymap,
    platform
  );

  return makeHotkeyHandler(activeHotkeys);
}
