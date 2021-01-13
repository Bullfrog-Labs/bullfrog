import { Editor } from "slate";
import {
  MentionElement,
  H2Element,
  H3Element,
  ParagraphElement,
  BlockquoteElement,
  CompactParagraphElement,
  CompactBlockquoteElement,
} from "./Rendering";
import {
  MentionPluginOptions,
  ParagraphPluginOptions,
  HeadingPluginOptions,
  BlockquotePluginOptions,
  WithAutoformatOptions,
  ExitBreakPluginOptions,
  SoftBreakPluginOptions,
  ResetBlockTypePluginOptions,
  AutoformatRule,
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
  unwrapList,
  toggleList,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_PARAGRAPH,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_LI,
  ELEMENT_UL,
} from "@blfrg.xyz/slate-plugins";

export type Options = {
  paragraph?: ParagraphPluginOptions;
  heading?: HeadingPluginOptions;
  mentions?: MentionPluginOptions;
  blockquote?: BlockquotePluginOptions;
  resetBlockType: ResetBlockTypePluginOptions;
  softBreak?: SoftBreakPluginOptions;
  exitBreak?: ExitBreakPluginOptions;
  autoformat: WithAutoformatOptions;
};

const preFormat = (editor: Editor) => unwrapList(editor);

/**
 * Base editor options.
 */

export const autoformatRules: AutoformatRule[] = [
  {
    type: ELEMENT_H2,
    markup: "#",
    preFormat,
  },
  {
    type: ELEMENT_H3,
    markup: "##",
    preFormat,
  },
  {
    type: MARK_BOLD,
    between: ["**", "**"],
    mode: "inline",
    insertTrigger: true,
  },
  {
    type: MARK_ITALIC,
    between: ["*", "*"],
    mode: "inline",
    insertTrigger: true,
  },
  {
    type: MARK_CODE,
    between: ["`", "`"],
    mode: "inline",
    insertTrigger: true,
  },
  {
    type: MARK_STRIKETHROUGH,
    between: ["~~", "~~"],
    mode: "inline",
    insertTrigger: true,
  },
  {
    type: ELEMENT_BLOCKQUOTE,
    markup: [">"],
    preFormat,
  },
  {
    type: ELEMENT_LI,
    markup: ["*", "-"],
    preFormat,
    format: (editor) => {
      toggleList(editor, { typeList: ELEMENT_UL });
    },
  },
];

export const mentionOptions: MentionPluginOptions = {
  mention: {
    component: MentionElement,
  },
};

export const paragraphOptions: ParagraphPluginOptions = {
  p: {
    component: ParagraphElement,
  },
};

export const headingOptions: HeadingPluginOptions = {
  h2: {
    component: H2Element,
  },
  h3: {
    component: H3Element,
  },
};

export const blockquoteOptions: BlockquotePluginOptions = {
  blockquote: {
    component: BlockquoteElement,
  },
};

export const headingTypes = [ELEMENT_H2, ELEMENT_H3];

const resetBlockTypesCommonRule = {
  types: [MARK_BOLD],
  defaultType: ELEMENT_PARAGRAPH,
};

export const resetBlockTypeOptions: ResetBlockTypePluginOptions = {
  rules: [
    {
      ...resetBlockTypesCommonRule,
      hotkey: "Enter",
      predicate: isBlockAboveEmpty,
    },
    {
      ...resetBlockTypesCommonRule,
      hotkey: "Backspace",
      predicate: isSelectionAtBlockStart,
    },
  ],
};

export const softBreakOptions: SoftBreakPluginOptions = {
  rules: [
    { hotkey: "shift+enter" },
    {
      hotkey: "enter",
      query: {
        allow: [ELEMENT_BLOCKQUOTE],
      },
    },
  ],
};

export const exitBreakOptions: ExitBreakPluginOptions = {
  rules: [
    {
      hotkey: "mod+enter",
    },
    {
      hotkey: "mod+shift+enter",
      before: true,
    },
    {
      hotkey: "enter",
      query: {
        start: true,
        end: true,
        allow: headingTypes,
      },
    },
  ],
};

export const autoformatOptions: WithAutoformatOptions = {
  rules: autoformatRules,
};

/**
 * Compact viewer options.
 */

export const compactParagraphOptions: ParagraphPluginOptions = {
  p: {
    component: CompactParagraphElement,
  },
};

export const compactBlockquoteOptions: BlockquotePluginOptions = {
  blockquote: {
    component: CompactBlockquoteElement,
  },
};

/**
 * Options sets.
 */

export const postEditorOptions: Options = {
  paragraph: paragraphOptions,
  heading: headingOptions,
  mentions: mentionOptions,
  blockquote: blockquoteOptions,
  resetBlockType: resetBlockTypeOptions,
  softBreak: softBreakOptions,
  exitBreak: exitBreakOptions,
  autoformat: autoformatOptions,
};

export const compactViewerOptions: Options = {
  paragraph: compactParagraphOptions,
  heading: headingOptions,
  mentions: mentionOptions,
  blockquote: compactBlockquoteOptions,
  resetBlockType: resetBlockTypeOptions,
  softBreak: softBreakOptions,
  exitBreak: exitBreakOptions,
  autoformat: autoformatOptions,
};
