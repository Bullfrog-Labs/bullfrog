import { PlatformAwareKeymap, Mark } from "./Types";
import { Editor } from "slate";
import { toggleMark } from "./marks";
import { platformAwareKeymapToHotkeyHandler } from "./Hotkeys";
import { IS_APPLE } from "./environment";

export const noopKBEventHandler = () => {
  return (event: KeyboardEvent) => {};
};

const toggleMarkHotkeyHandler = (editor: Editor, mark: Mark) => (
  event: KeyboardEvent
) => {
  event.preventDefault();
  toggleMark(editor, mark);
};

export const hotkeyHandler = (editor: Editor) => {
  const PLATFORM_AWARE_KEYMAP: PlatformAwareKeymap = {
    generic: {
      bold: ["mod+b", toggleMarkHotkeyHandler(editor, "bold")],
      italic: ["mod+i", toggleMarkHotkeyHandler(editor, "italic")],
      underline: ["mod+u", toggleMarkHotkeyHandler(editor, "underline")],
      code: ["mod+c", toggleMarkHotkeyHandler(editor, "code")],
    },
    platformSpecific: {
      apple: {},
      windows: {},
    },
  };

  // Note that IS_APPLE will only work in a browser environemnt, not in headless test environments.
  return platformAwareKeymapToHotkeyHandler(PLATFORM_AWARE_KEYMAP, IS_APPLE);
};
