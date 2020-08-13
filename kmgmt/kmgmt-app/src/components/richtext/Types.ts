export type HotkeySpec = string | string[];
export type KBEventHandler = (event: KeyboardEvent) => void;
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

export const SECTION_BLOCKS = ["heading-1", "heading-2"]; // not supported yet
export const LIST_BLOCKS = ["bulleted-list", "numbered-list"];
export const BLOCKS = ["block-quote", "list-item", ...LIST_BLOCKS];

export type SectionBlock = typeof SECTION_BLOCKS[number];
export type ListBlock = typeof LIST_BLOCKS[number];
export type Block = typeof BLOCKS[number];

export const isList = (block: Block): block is ListBlock => {
  return LIST_BLOCKS.includes(block);
};
