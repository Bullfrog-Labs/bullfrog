import React, {
  useEffect,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { ReactEditor, Slate, useFocused } from "slate-react";
import { createEditor, Operation, Transforms } from "slate";
import { CodeAlt } from "@styled-icons/boxicons-regular/CodeAlt";
import { RichText } from "./Types";
import {
  FormatBold,
  FormatItalic,
  LooksOne,
  LooksTwo,
  FormatQuote,
} from "@styled-icons/material";
import * as log from "loglevel";
import {
  MentionSelect,
  MentionNodeData,
  ToolbarElement,
  useMention,
  pipe,
  ELEMENT_H2,
  ELEMENT_H3,
  BalloonToolbar,
  MARK_CODE,
  MARK_BOLD,
  MARK_ITALIC,
  ToolbarMark,
  ELEMENT_BLOCKQUOTE,
} from "@blfrg.xyz/slate-plugins";
import { EditablePlugins } from "@udecode/slate-plugins-core";
import { Typography } from "@material-ui/core";
import * as EditorPlugins from "./EditorPlugins";
import {
  Options,
  postEditorOptions,
  postViewerOptions,
  compactViewerOptions,
} from "./EditorOptions";
import { useGlobalStyles } from "../../styles/styles";
import theme from "../../styles/theme";
import { LogEventFn } from "../../services/Analytics";

// TODO: Figure out why navigation within text using arrow keys does not work
// properly, whereas using control keys works fine.

// The implementation below is based off of
// https://github.com/ianstormtaylor/slate/blob/master/site/examples/richtext.js.

export type Body = RichText;

export type RichTextEditorMentionTypeaheadComponents = {
  mentionables: MentionNodeData[];
  onMentionSearchChanged: (search: string) => void;
  onMentionAdded: (option: MentionNodeData) => void;
  mentionableElementFn?: (option: MentionNodeData) => JSX.Element;
};

export type RichTextEditorProps = {
  body: Body;
  readOnly?: boolean;
  options?: Options;
  onChange: (newBody: Body) => void;
  mentionTypeaheadComponents?: RichTextEditorMentionTypeaheadComponents;
  logEvent?: LogEventFn;
};

const didOpsAffectContent = (ops: Operation[]): boolean => {
  return ops.some((op) => !Operation.isSelectionOperation(op));
};

export type RichTextEditorImperativeHandle = {
  focusEditor: () => void;
  blurEditor: () => void;
};

const addMentionsClickHandler = (options: Options, logEvent: LogEventFn) => {
  if (!options.mentions) {
    options.mentions = {};
  }
  if (!options.mentions.mention) {
    options.mentions.mention = {};
  }
  if (!options.mentions.mention.rootProps) {
    options.mentions.mention.rootProps = {};
  }
  options.mentions.mention.rootProps.onClick = ({
    value,
  }: {
    value: string;
  }) => {
    logEvent("click_inline_mention", { value });
  };
};

const RichTextEditor = forwardRef<
  RichTextEditorImperativeHandle,
  RichTextEditorProps
>((props, ref) => {
  const logger = log.getLogger("RichTextEditor");
  const {
    logEvent = (name, params) => {},
    options,
    mentionTypeaheadComponents,
    onChange,
    body,
    readOnly,
  } = props;
  const editorOptions =
    options || (readOnly ? postViewerOptions : postEditorOptions);

  // A little hacky, but fine.
  addMentionsClickHandler(editorOptions, logEvent);

  const [plugins, decorator] = useMemo(
    () => EditorPlugins.createPlugins(editorOptions),
    [editorOptions]
  );

  // We use a ref here because the editor instance must not change across reloads, but
  // hot reload in react will force even useMemo to reload.
  const editorRef = useRef<ReactEditor>();
  if (!editorRef.current) {
    editorRef.current = pipe(createEditor(), decorator);
  }

  const editor = editorRef.current;

  const globalClasses = useGlobalStyles();

  const {
    mentionables,
    onMentionAdded,
    onMentionSearchChanged,
    mentionableElementFn,
  } = mentionTypeaheadComponents ?? {
    mentionables: [],
    onMentionAdded: (option: MentionNodeData) => {},
    onMentionSearchChanged: (search: string) => {},
    mentionableElementFn: (option) => <Typography>{option.value}</Typography>,
  };

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
  } = useMention(mentionables, onMentionAdded, {
    maxSuggestions: 10,
  });

  useEffect(() => {
    onMentionSearchChanged(search);
  }, [search, onMentionSearchChanged]);

  const handleChange = (newBody: Body) => {
    if (didOpsAffectContent(editor.operations)) {
      onChange(newBody);
    }
  };

  const onClickMention = (editor: ReactEditor, option: MentionNodeData) => {
    logger.debug(`on click mention ${JSON.stringify(option)}`);
    onAddMention(editor, option);
    onMentionAdded(option);
  };

  /**
   * There's a bug - in slate i think - where the selection and content of
   * the doc are not always kept in sync. When plugins like this one try to
   * perform operations that depend on both the content and the selection
   * they sometimes crash when you ex. navigate between pages. For the
   * toolbar we can avoid issues by not enabling unless we have Focus. Focus
   * seems to reset the selection.
   */
  const Toolbar = () => {
    const focused = useFocused();
    if (focused) {
      return (
        <BalloonToolbar direction="top" hiddenDelay={500}>
          <ToolbarElement type={ELEMENT_H2} icon={<LooksOne />} />
          <ToolbarElement type={ELEMENT_H3} icon={<LooksTwo />} />
          <ToolbarElement type={ELEMENT_BLOCKQUOTE} icon={<FormatQuote />} />
          <ToolbarMark type={MARK_BOLD} icon={<FormatBold />} />
          <ToolbarMark type={MARK_ITALIC} icon={<FormatItalic />} />
          <ToolbarMark type={MARK_CODE} icon={<CodeAlt />} />
        </BalloonToolbar>
      );
    } else {
      return <></>;
    }
  };

  return (
    <Slate
      editor={editor}
      value={body}
      onChange={(newValue) => {
        handleChange(newValue);
        onChangeMention(editor);
      }}
    >
      <EditablePlugins
        plugins={plugins}
        readOnly={readOnly ?? false}
        placeholder={readOnly ? "Nothing here yet" : "Enter some text"}
        autoFocus
        spellCheck={false}
        onKeyDown={[onKeyDownMention]}
        onKeyDownDeps={[index, search, target, values]}
        className={
          readOnly
            ? globalClasses.readOnlyRichText
            : globalClasses.editableRichText
        }
      />
      {!readOnly && (
        <MentionSelect
          at={target}
          valueIndex={index}
          options={values}
          onClickMention={onClickMention}
          rowElementFn={mentionableElementFn}
          styles={{
            mentionItemSelected: {
              backgroundColor: theme.palette.action.selected,
            },
          }}
        />
      )}
      <Toolbar />
    </Slate>
  );
});

export const RichTextCompactViewer = (props: { body: RichText }) => {
  return (
    <RichTextEditor
      readOnly={true}
      body={props.body}
      options={compactViewerOptions}
      onChange={(newBody: Body) => {}}
    />
  );
};

export default RichTextEditor;
