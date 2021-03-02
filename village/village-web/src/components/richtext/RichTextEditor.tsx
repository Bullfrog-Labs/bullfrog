import React, {
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { ReactEditor, Slate } from "slate-react";
import { createEditor, Operation } from "slate";
import { RichText } from "./Types";
import { LooksOne, LooksTwo } from "@styled-icons/material";
import * as log from "loglevel";
import {
  MentionSelect,
  MentionNodeData,
  HeadingToolbar,
  ToolbarElement,
  useMention,
  pipe,
  ELEMENT_H2,
  ELEMENT_H3,
} from "@blfrg.xyz/slate-plugins";
import { EditablePlugins } from "@blfrg.xyz/slate-plugins-core";
import { Typography } from "@material-ui/core";
import * as EditorPlugins from "./EditorPlugins";
import {
  Options,
  postEditorOptions,
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
  enableToolbar?: boolean;
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
    enableToolbar,
  } = props;
  const editorOptions = options || postEditorOptions;

  // A little hacky, but fine.
  addMentionsClickHandler(editorOptions, logEvent);

  const [plugins, decorator] = useMemo(
    () => EditorPlugins.createPlugins(editorOptions),
    [editorOptions]
  );
  const editor = useMemo(() => pipe(createEditor(), decorator), [decorator]);
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
      value={body}
      onChange={(newValue) => {
        handleChange(newValue);
        onChangeMention(editor);
      }}
    >
      {!!enableToolbar && toolbar}
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
    </Slate>
  );
});

export const RichTextCompactViewer = (props: { body: RichText }) => {
  return (
    <RichTextEditor
      readOnly={true}
      body={props.body}
      enableToolbar={false}
      options={compactViewerOptions}
      onChange={(newBody: Body) => {}}
    />
  );
};

export default RichTextEditor;
