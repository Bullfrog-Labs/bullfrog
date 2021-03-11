import { Editor } from "slate";
import { DEFAULTS_LIST, pipe } from "@udecode/slate-plugins";
import { SlatePlugin } from "@udecode/slate-plugins-core";
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
  LinkPlugin,
  withLink,
} from "@udecode/slate-plugins";
import { withHistory } from "slate-history";
import { ReactEditor, withReact } from "slate-react";
import { Options } from "./EditorOptions";

type PluginComponents = [SlatePlugin[], SlateReactWithPlugin];

type SlateReactWithPlugin = <T extends Editor>(editor: T) => ReactEditor;

export const createPlugins = (options: Options): PluginComponents => {
  const {
    paragraph,
    heading,
    blockquote,
    link,
    resetBlockType,
    softBreak,
    exitBreak,
    autoformat,
  } = options;

  const plugins = [
    ParagraphPlugin(paragraph),
    HeadingPlugin(heading),
    BoldPlugin(),
    ItalicPlugin(),
    CodePlugin(),
    StrikethroughPlugin(),
    BlockquotePlugin(blockquote),
    ListPlugin(DEFAULTS_LIST),
    LinkPlugin(link),
    KbdPlugin(),
    ResetBlockTypePlugin(resetBlockType),
    SoftBreakPlugin(softBreak),
    ExitBreakPlugin(exitBreak),
  ];

  const withPlugins = [
    withReact,
    withHistory,
    withLink(
      Object.assign({}, link, {
        rangeBeforeOptions: {
          multiPaths: false,
        },
      })
    ),
    withList(DEFAULTS_LIST),
    withAutoformat(autoformat),
    withInlineVoid({ plugins }),
  ] as const;

  const withPlugin = (editor: Editor): ReactEditor => {
    return pipe(editor, ...withPlugins);
  };

  return [plugins, withPlugin];
};
