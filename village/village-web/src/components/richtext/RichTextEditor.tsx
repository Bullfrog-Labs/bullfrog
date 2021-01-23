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

// TODO: Figure out why navigation within text using arrow keys does not work
// properly, whereas using control keys works fine.

// The implementation below is based off of
// https://github.com/ianstormtaylor/slate/blob/master/site/examples/richtext.js.

export type Body = RichText;

// TODO: How to make this work for readonly? Need to make it not require stuff
// that isn't present when there's no user.
export type RichTextEditorProps = {
  body: Body;
  enableToolbar?: boolean;
  readOnly?: boolean;
  mentionables: MentionNodeData[];
  options?: Options;
  onChange: (newBody: Body) => void;
  onMentionSearchChanged: (search: string) => void;
  onMentionAdded: (option: MentionNodeData) => void;
  mentionableElementFn?: (option: MentionNodeData) => JSX.Element;
};

const didOpsAffectContent = (ops: Operation[]): boolean => {
  return ops.some((op) => !Operation.isSelectionOperation(op));
};

export type RichTextEditorImperativeHandle = {
  focusEditor: () => void;
  blurEditor: () => void;
};

const RichTextEditor = forwardRef<
  RichTextEditorImperativeHandle,
  RichTextEditorProps
>((props, ref) => {
  const logger = log.getLogger("RichTextEditor");
  const [plugins, decorator] = useMemo(
    () => EditorPlugins.createPlugins(props.options || postEditorOptions),
    [props.options]
  );
  const editor = useMemo(() => pipe(createEditor(), decorator), [decorator]);
  const globalClasses = useGlobalStyles();

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
        placeholder={props.readOnly ? "Nothing here yet" : "Enter some text"}
        autoFocus
        spellCheck={false}
        onKeyDown={[onKeyDownMention]}
        onKeyDownDeps={[index, search, target, values]}
        className={
          props.readOnly
            ? globalClasses.readOnlyRichText
            : globalClasses.editableRichText
        }
      />
      {!props.readOnly && (
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
      mentionables={[]}
      options={compactViewerOptions}
      onChange={(newBody: Body) => {}}
      onMentionSearchChanged={(search: string) => {}}
      onMentionAdded={(option: MentionNodeData) => {}}
    />
  );
};

export default RichTextEditor;
