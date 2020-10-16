import {
  PlatformAwareKeymap,
  Mark,
  KBEventHandler,
  MouseEventHandler,
} from "./Types";
import { Editor } from "slate";
import { toggleMark } from "./Marks";
import { platformAwareKeymapToHotkeyHandler } from "./Hotkeys";
import { PLATFORM } from "./Environment";
import { moveOut, nestSection } from "./Structure";

export const noopKBEventHandler = () => {
  return (event: KeyboardEvent) => {};
};

const toggleMarkHotkeyHandler = (editor: Editor, mark: Mark) => (
  event: KeyboardEvent
) => {
  event.preventDefault();
  toggleMark(editor, mark);
};

const nestSectionHotkeyHandler = (editor: Editor) => (event: KeyboardEvent) => {
  event.preventDefault();
  nestSection(editor);
};

const moveOutHotkeyHandler = (editor: Editor) => (event: KeyboardEvent) => {
  event.preventDefault();
  moveOut(editor);
};

export const hotkeyHandler = (editor: Editor) => {
  const PLATFORM_AWARE_KEYMAP: PlatformAwareKeymap = {
    generic: {
      bold: ["mod+b", toggleMarkHotkeyHandler(editor, "bold")],
      italic: ["mod+i", toggleMarkHotkeyHandler(editor, "italic")],
      underline: ["mod+u", toggleMarkHotkeyHandler(editor, "underline")],
      code: ["mod+shift+c", toggleMarkHotkeyHandler(editor, "code")],
      wrap: ["tab", nestSectionHotkeyHandler(editor)],
      moveOut: ["shift+tab", moveOutHotkeyHandler(editor)],
    },
    platformSpecific: {
      apple: {},
      windows: {},
    },
  };

  // Note that PLATFORM will only work in a browser environemnt, not in headless test environments.
  return platformAwareKeymapToHotkeyHandler(PLATFORM_AWARE_KEYMAP, PLATFORM);
};

export const toReactKBEventHandler = (kbEventHandler: KBEventHandler) => (
  reactEvent: React.KeyboardEvent
) => kbEventHandler(reactEvent.nativeEvent);

export const toReactMouseEventHandler = (
  mouseEventHandler: MouseEventHandler
) => (reactEvent: React.MouseEvent, value: any) =>
  mouseEventHandler(reactEvent.nativeEvent, value);
