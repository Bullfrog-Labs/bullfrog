import React, {
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { ReactEditor, withReact, Slate } from "slate-react";
import { createEditor, Operation, Editor } from "slate";
import { withHistory } from "slate-history";
import { RichText } from "./Types";
import { LooksOne, LooksTwo } from "@styled-icons/material";
import {
  MentionElement,
  H2Element,
  H3Element,
  ParagraphElement,
  BlockquoteElement,
} from "./Rendering";
import * as log from "loglevel";
import {
  ResetBlockTypePlugin,
  SoftBreakPlugin,
  ExitBreakPlugin,
  MentionPlugin,
  MentionPluginOptions,
  ParagraphPlugin,
  ParagraphPluginOptions,
  HeadingPlugin,
  HeadingPluginOptions,
  MentionSelect,
  MentionNodeData,
  HeadingToolbar,
  ToolbarElement,
  useMention,
  withInlineVoid,
  withAutoformat,
  AutoformatRule,
  pipe,
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
  ELEMENT_H2,
  ELEMENT_H3,
  unwrapList,
  ELEMENT_PARAGRAPH,
  ResetBlockTypePluginOptions,
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  BlockquotePlugin,
  ELEMENT_BLOCKQUOTE,
  ListPlugin,
  withList,
  ELEMENT_LI,
  toggleList,
  ELEMENT_UL,
  KbdPlugin,
  BlockquotePluginOptions,
} from "@blfrg.xyz/slate-plugins";
import { EditablePlugins } from "@blfrg.xyz/slate-plugins-core";
import { Typography } from "@material-ui/core";

// TODO: Figure out why navigation within text using arrow keys does not work
// properly, whereas using control keys works fine.

// The implementation below is based off of
// https://github.com/ianstormtaylor/slate/blob/master/site/examples/richtext.js.

export type Body = RichText;

export type RichTextEditorProps = {
  body: Body;
  onChange: (newBody: Body) => void;
  enableToolbar?: boolean;
  readOnly?: boolean;
  onMentionSearchChanged: (search: string) => void;
  mentionables: MentionNodeData[];
  onMentionAdded: (option: MentionNodeData) => void;
  mentionableElementFn?: (option: MentionNodeData) => JSX.Element;
};

const didOpsAffectContent = (ops: Operation[]): boolean => {
  return ops.some((op) => !Operation.isSelectionOperation(op));
};

const preFormat = (editor: Editor) => unwrapList(editor);

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

const mentionOptions: MentionPluginOptions = {
  mention: {
    component: MentionElement,
  },
};

const paragraphOptions: ParagraphPluginOptions = {
  p: {
    component: ParagraphElement,
  },
};

const headingOptions: HeadingPluginOptions = {
  h2: {
    component: H2Element,
  },
  h3: {
    component: H3Element,
  },
};

const blockquoteOptions: BlockquotePluginOptions = {
  blockquote: {
    component: BlockquoteElement,
  },
};

export const headingTypes = [ELEMENT_H2, ELEMENT_H3];

const resetBlockTypesCommonRule = {
  types: [MARK_BOLD],
  defaultType: ELEMENT_PARAGRAPH,
};

export const optionsResetBlockTypes: ResetBlockTypePluginOptions = {
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

const plugins = [
  ParagraphPlugin(paragraphOptions),
  HeadingPlugin(headingOptions),
  MentionPlugin(mentionOptions),
  BoldPlugin(),
  ItalicPlugin(),
  CodePlugin(),
  StrikethroughPlugin(),
  BlockquotePlugin(blockquoteOptions),
  ListPlugin(),
  KbdPlugin(),
  ResetBlockTypePlugin(optionsResetBlockTypes),
  SoftBreakPlugin({
    rules: [
      { hotkey: "shift+enter" },
      {
        hotkey: "enter",
        query: {
          allow: [ELEMENT_BLOCKQUOTE],
        },
      },
    ],
  }),
  ExitBreakPlugin({
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
  }),
];

const withPlugins = [
  withReact,
  withHistory,
  withList(),
  withAutoformat({
    rules: autoformatRules,
  }),
  withInlineVoid({ plugins }),
] as const;

export type RichTextEditorImperativeHandle = {
  focusEditor: () => void;
  blurEditor: () => void;
};

const RichTextEditor = forwardRef<
  RichTextEditorImperativeHandle,
  RichTextEditorProps
>((props, ref) => {
  const logger = log.getLogger("RichTextEditor");
  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

  let onMentionAdded = props.onMentionAdded;
  if (!onMentionAdded) {
    onMentionAdded = (option: MentionNodeData) => {};
  }
  let onMentionSearchChanged = props.onMentionSearchChanged;
  if (!onMentionSearchChanged) {
    onMentionSearchChanged = (search: string) => {};
  }
  let mentionableElementFn = props.mentionableElementFn;
  if (!mentionableElementFn) {
    mentionableElementFn = (option) => <Typography>{option.value}</Typography>;
  }

  useImperativeHandle(ref, () => ({
    focusEditor: () => ReactEditor.focus(editor),
    blurEditor: () => ReactEditor.blur(editor),
  }));

  const {
    onAddMention,
    onChangeMention,
    onKeyDownMention,
    search,
    index,
    target,
    values,
  } = useMention(props.mentionables, onMentionAdded, {
    maxSuggestions: 10,
  });

  useEffect(() => {
    onMentionSearchChanged(search);
  }, [search, onMentionSearchChanged]);

  const onChange = (newBody: Body) => {
    if (didOpsAffectContent(editor.operations)) {
      props.onChange(newBody);
    }
  };

  const onClickMention = (editor: ReactEditor, option: MentionNodeData) => {
    logger.debug(`on click mention ${JSON.stringify(option)}`);
    onAddMention(editor, option);
    onMentionAdded(option);
  };

  const toolbar = (
    <React.Fragment>
      <HeadingToolbar>
        <ToolbarElement type={ELEMENT_H2} icon={<LooksOne />} />
        <ToolbarElement type={ELEMENT_H3} icon={<LooksTwo />} />
      </HeadingToolbar>
    </React.Fragment>
  );
  return (
    <Slate
      editor={editor}
      value={props.body}
      onChange={(newValue) => {
        onChange(newValue);
        onChangeMention(editor);
      }}
    >
      {!!props.enableToolbar && toolbar}
      <EditablePlugins
        plugins={plugins}
        readOnly={props.readOnly ?? false}
        placeholder="Enter some text"
        spellCheck
        autoFocus
        onKeyDown={[onKeyDownMention]}
        onKeyDownDeps={[index, search, target, values]}
      />
      <MentionSelect
        at={target}
        valueIndex={index}
        options={values}
        onClickMention={onClickMention}
        rowElementFn={mentionableElementFn}
      />
    </Slate>
  );
});

export default RichTextEditor;
