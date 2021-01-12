import { Editor } from "slate";
import {
  MentionPluginOptions,
  ParagraphPluginOptions,
  HeadingPluginOptions,
  ResetBlockTypePluginOptions,
  BlockquotePluginOptions,
  WithAutoformatOptions,
  ExitBreakPluginOptions,
  SoftBreakPluginOptions,
  pipe,
} from "@blfrg.xyz/slate-plugins";
import { SlatePlugin } from "@blfrg.xyz/slate-plugins-core";
import {
  ResetBlockTypePlugin,
  SoftBreakPlugin,
  ExitBreakPlugin,
  MentionPlugin,
  ParagraphPlugin,
  HeadingPlugin,
  withInlineVoid,
  withAutoformat,
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  BlockquotePlugin,
  ListPlugin,
  withList,
  KbdPlugin,
} from "@blfrg.xyz/slate-plugins";
import { withHistory } from "slate-history";
import { ReactEditor, withReact } from "slate-react";
import {
  paragraphOptions,
  headingOptions,
  mentionOptions,
  blockquoteOptions,
  resetBlockTypeOptions,
  softBreakOptions,
  exitBreakOptions,
  autoformatOptions,
} from "./EditorOptions";

type Options = {
  paragraph?: ParagraphPluginOptions;
  heading?: HeadingPluginOptions;
  mentions?: MentionPluginOptions;
  blockquote?: BlockquotePluginOptions;
  resetBlockType?: ResetBlockTypePluginOptions;
  softBreak?: SoftBreakPluginOptions;
  exitBreak?: ExitBreakPluginOptions;
  autoformat?: WithAutoformatOptions;
};

const createPlugins = (options: Options = {}): PluginComponents => {
  const {
    paragraph = paragraphOptions,
    heading = headingOptions,
    mentions = mentionOptions,
    blockquote = blockquoteOptions,
    resetBlockType = resetBlockTypeOptions,
    softBreak = softBreakOptions,
    exitBreak = exitBreakOptions,
    autoformat = autoformatOptions,
  } = options;

  const plugins = [
    ParagraphPlugin(paragraph),
    HeadingPlugin(heading),
    MentionPlugin(mentions),
    BoldPlugin(),
    ItalicPlugin(),
    CodePlugin(),
    StrikethroughPlugin(),
    BlockquotePlugin(blockquote),
    ListPlugin(),
    KbdPlugin(),
    ResetBlockTypePlugin(resetBlockType),
    SoftBreakPlugin(softBreak),
    ExitBreakPlugin(exitBreak),
  ];

  const withPlugins = [
    withReact,
    withHistory,
    withList(),
    withAutoformat(autoformat),
    withInlineVoid({ plugins }),
  ] as const;

  const withPlugin = (editor: Editor): ReactEditor => {
    return pipe(editor, ...withPlugins);
  };

  return [plugins, withPlugin];
};

export const createPreviewEditorPlugins = () => {};

type PluginComponents = [SlatePlugin[], SlateReactWithPlugin];

type SlateReactWithPlugin = <T extends Editor>(editor: T) => ReactEditor;

export const createPostEditorPlugins = (): PluginComponents => {
  return createPlugins();
};
