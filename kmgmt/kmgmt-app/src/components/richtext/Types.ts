import { type } from "os";
import { Node as SlateNode } from "slate";

export type HotkeySpec = string | string[];
export type KBEventHandler = (event: KeyboardEvent) => void;
export type MouseEventHandler = (event: MouseEvent, value: any) => void;
export type KeymapEntry = [HotkeySpec, KBEventHandler];

export type Platform = "generic" | "apple" | "windows";

export type Keymap = { [commandName: string]: KeymapEntry };
export type PlatformSpecificKeymap = { [platform: string]: Keymap };

export interface PlatformAwareKeymap {
  generic: Keymap;
  platformSpecific: PlatformSpecificKeymap;
}

export const MARKS = ["bold", "italic", "underline", "code"] as const;
export type Mark = typeof MARKS[number];

export const LIST_BLOCKS = ["bulleted-list", "numbered-list"];
export const FORMAT_BLOCKS = ["block-quote", "list-item", ...LIST_BLOCKS];

export const STRUCTURE_BLOCKS = ["section"];
export const BLOCKS = [...FORMAT_BLOCKS, ...STRUCTURE_BLOCKS];

export type ListBlock = typeof LIST_BLOCKS[number];
export type FormatBlock = typeof FORMAT_BLOCKS[number];
export type StructureBlock = typeof STRUCTURE_BLOCKS[number];
export type Block = typeof BLOCKS[number];

export const isList = (block: Block): block is ListBlock => {
  return LIST_BLOCKS.includes(block);
};

export const STRUCTURE_ACTIONS = ["toggle-structure-mode"];
export type StructureAction = typeof STRUCTURE_ACTIONS[number];

export const STRUCTURE_MODES = ["outline-mode", "edit-mode"];
export type StructureMode = typeof STRUCTURE_MODES[number];

export type RichText = SlateNode[];
