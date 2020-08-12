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

const marks = ["bold", "italic", "underline", "code"] as const;
export type Mark = typeof marks[number];

const sectionBlocks = ["heading-1", "heading-2"]; // not supported yet
const listBlocks = ["bulleted-list", "numbered-list"];
const blocks = ["block-quote", "list-item", ...listBlocks];

export type SectionBlock = typeof sectionBlocks[number];
export type ListBlock = typeof listBlocks[number];
export type Block = typeof blocks[number];

export const isList = (block: Block): block is ListBlock => {
  return listBlocks.includes(block);
};
