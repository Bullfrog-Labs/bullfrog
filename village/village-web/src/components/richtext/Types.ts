import { Node as SlateNode } from "slate";

export type Platform = "generic" | "apple" | "windows";

export type KBEventHandler = (event: KeyboardEvent) => void;

export type RichText = SlateNode[];
