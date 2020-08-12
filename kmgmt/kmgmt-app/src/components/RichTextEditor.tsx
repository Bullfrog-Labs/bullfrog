import React, { useState, useCallback, useMemo } from "react";
import { ReactEditor, withReact, Slate, Editable, useSlate } from "slate-react";
import { createEditor, Editor, Text, Transforms } from "slate";
import { withHistory } from "slate-history";

import {
  Toolbar,
  Grid,
  Container,
  Divider,
  Typography,
} from "@material-ui/core";
import FormatBoldIcon from "@material-ui/icons/FormatBold";
import FormatItalicIcon from "@material-ui/icons/FormatItalic";
import FormatUnderlinedIcon from "@material-ui/icons/FormatUnderlined";
import CodeIcon from "@material-ui/icons/Code";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import { makeStyles, withStyles } from "@material-ui/core/styles";

import {
  Node as SlateNode,
  Element as SlateElement,
  Editor as SlateEditor,
} from "slate";

import LooksOneIcon from "@material-ui/icons/LooksOne";
import LooksTwoIcon from "@material-ui/icons/LooksTwo";
import Looks3Icon from "@material-ui/icons/Looks3";
import Looks4Icon from "@material-ui/icons/Looks4";
import Looks5Icon from "@material-ui/icons/Looks5";
import FormatQuoteIcon from "@material-ui/icons/FormatQuote";
import FormatListBulletedIcon from "@material-ui/icons/FormatListBulleted";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";

// TODO: Figure out why navigation within text using arrow keys does not work
// properly, whereas using control keys works fine.

// The implementation below is based off of
// https://github.com/ianstormtaylor/slate/blob/master/site/examples/richtext.js.

type SlateMark = Record<string, any>;

type HotkeyChecker = (key: string) => boolean;
type HotkeyHandler = (editor: SlateEditor, mark: SlateMark) => void;

const SUPPORTED_HOTKEYS: [HotkeyChecker, HotkeyHandler][] = [
  // isBold: "bold",
  [isBold],
  // "mod+i": "italic",
  // "mod+u": "underline",
  // "mod+`": "code",
];

const FORMATS = ["bold", "italic", "underline", "code"];

const HEADING_BLOCKS = ["heading-1", "heading-2"];
const BLOCKS = [
  "block-quote",
  "bulleted-list",
  ...HEADING_BLOCKS,
  "list-item",
  "numbered-list",
];

const LIST_TYPES = ["numbered-list", "bulleted-list"];

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case "block-quote":
      return (
        <blockquote {...attributes}>
          <Typography variant="body1">{children}</Typography>
        </blockquote>
      );
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "heading-1":
      return (
        <Typography variant="h2" {...attributes}>
          {children}
        </Typography>
      );
    case "heading-2":
      return (
        <Typography variant="h3" {...attributes}>
          {children}
        </Typography>
      );
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>;
    default:
      return (
        <Typography variant="body1" paragraph={true} {...attributes}>
          {children}
        </Typography>
      );
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.code) {
    children = <code>{children}</code>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  return <span {...attributes}>{children}</span>;
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const useStyles = makeStyles((theme) => ({
  paper: {
    display: "flex",
    border: `1px solid ${theme.palette.divider}`,
    flexWrap: "wrap",
  },
  divider: {
    margin: theme.spacing(1, 0.5),
  },
}));

const StyledToggleButtonGroup = withStyles((theme) => ({
  grouped: {
    margin: theme.spacing(0.5),
    border: "none",
    "&:not(:first-child)": {
      borderRadius: theme.shape.borderRadius,
    },
    "&:first-child": {
      borderRadius: theme.shape.borderRadius,
    },
  },
}))(ToggleButtonGroup);

const MarkButtonGroup = () => {
  const editor = useSlate();

  const getActiveFormats = () => {
    return FORMATS.filter((x) => isMarkActive(editor, x));
  };

  const handleFormat = (event, newFormats) => {
    event.preventDefault();

    // Handle update to formats
    const newlyActiveFormats = newFormats.filter(
      (x) => !isMarkActive(editor, x)
    );
    const newlyInactiveFormats = getActiveFormats().filter(
      (x) => !newFormats.includes(x)
    );

    for (let format of newlyActiveFormats) {
      Editor.addMark(editor, format, true);
    }

    for (let format of newlyInactiveFormats) {
      Editor.removeMark(editor, format);
    }

    // Need to move focus back to editor to keep the selection.
    ReactEditor.focus(editor);
  };

  return (
    <StyledToggleButtonGroup
      size="small"
      value={getActiveFormats()}
      onChange={handleFormat}
      aria-label="text formatting"
    >
      <ToggleButton value="bold" aria-label="bold">
        <FormatBoldIcon />
      </ToggleButton>
      <ToggleButton value="italic" aria-label="italic">
        <FormatItalicIcon />
      </ToggleButton>
      <ToggleButton value="underline" aria-label="underline">
        <FormatUnderlinedIcon />
      </ToggleButton>
      <ToggleButton value="code" aria-label="code">
        <CodeIcon />
      </ToggleButton>
    </StyledToggleButtonGroup>
  );
};

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === format,
  });

  return !!match;
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) => LIST_TYPES.includes(n.type),
    split: true,
  });

  Transforms.setNodes(editor, {
    type: isActive ? "paragraph" : isList ? "list-item" : format,
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const BlockButtonGroup = () => {
  const editor = useSlate();
  const activeBlocks = BLOCKS.filter((x) => isBlockActive(editor, x));
  const activeBlock = activeBlocks.length === 1 ? activeBlocks[0] : null;

  const handleBlock = (event, newBlock) => {
    event.preventDefault();
    toggleBlock(editor, newBlock);

    // Need to move focus back to editor to keep the selection.
    ReactEditor.focus(editor);
  };

  return (
    <StyledToggleButtonGroup
      size="small"
      exclusive
      value={activeBlock}
      onChange={handleBlock}
      aria-label="block type selection"
    >
      <ToggleButton value="heading-1" aria-label="heading-1">
        <LooksOneIcon />
      </ToggleButton>
      <ToggleButton value="heading-2" aria-label="heading-2">
        <LooksTwoIcon />
      </ToggleButton>
      <ToggleButton value="heading-3" aria-label="heading-3">
        <Looks3Icon />
      </ToggleButton>
      <ToggleButton value="heading-4" aria-label="heading-4">
        <Looks4Icon />
      </ToggleButton>
      <ToggleButton value="heading-5" aria-label="heading-5">
        <Looks5Icon />
      </ToggleButton>
      <ToggleButton value="block-quote" aria-label="block-quote">
        <FormatQuoteIcon />
      </ToggleButton>
      <ToggleButton value="bulleted-list" aria-label="bulleted-list">
        <FormatListBulletedIcon />
      </ToggleButton>
      <ToggleButton value="numbered-list" aria-label="numbered-list">
        <FormatListNumberedIcon />
      </ToggleButton>
    </StyledToggleButtonGroup>
  );
};

const RichTextEditorToolbar = () => {
  const classes = useStyles();

  return (
    <Toolbar>
      <MarkButtonGroup />
      <Divider flexItem orientation="vertical" className={classes.divider} />
      <BlockButtonGroup />
    </Toolbar>
  );
};

// TODO: need to make it so that inserting a break from inside a heading does
// not cause the heading itself to become a paragraph.
const withResetBlockOnInsertBreak = (editor) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    insertBreak();

    for (let block in HEADING_BLOCKS.filter((x) => isBlockActive(editor, x))) {
      toggleBlock(editor, block);
    }
  };

  return editor;
};

const withEditableTypographyLayout = (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    if (Text.isText(node)) {
      // Make sure that there are no newlines in the text
      const newNode = {
        text: node.text.replace(/\r?\n|\r/g, ""),
      };
      Transforms.setNodes(editor, newNode, { at: path });
    } else {
      // Merge all nodes into a single text node
      if (path.length > 0 && path[path.length - 1] !== 0) {
        Transforms.mergeNodes(editor, { at: path, voids: true });
      }
    }

    return normalizeNode(entry);
  };

  return editor;
};

const EditableTypography = ({ initialValue, variant, handleEscape }) => {
  if (initialValue === undefined) {
    initialValue = [
      {
        type: "paragraph",
        children: [{ text: "" }],
      },
    ];
  }
  const [value, setValue] = useState(initialValue);
  const editor = useMemo(
    () => withEditableTypographyLayout(withHistory(withReact(createEditor()))),
    []
  );

  const renderLeaf = useCallback(
    ({ children, attributes }) => (
      <Typography variant={variant} {...attributes}>
        {children}
      </Typography>
    ),
    [variant]
  );

  return (
    <Slate editor={editor} value={value} onChange={setValue}>
      <Editable
        placeholder="Enter a title"
        renderLeaf={renderLeaf}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === "Escape") {
            event.preventDefault();
            if (handleEscape) {
              handleEscape(event);
            }
          }
        }}
      />
    </Slate>
  );
};

const DocumentTitle = (props) => {
  return <EditableTypography variant="h1" {...props} />;
};

type Title = string | undefined;
type Body = SlateNode[];

interface NoteRecord {
  title: Title;
  body: Body;
}

const emptyNoteRecord: NoteRecord = {
  title: undefined,
  body: [
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
  ],
};

const RichTextEditor = () => {
  // TODO: Modify value to also include document title.
  // TODO: Modify document title to be synced with state.
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  const [title, setTitle] = useState<Title>(emptyNoteRecord.title);
  const [body, setBody] = useState<Body>(emptyNoteRecord.body);

  const editor = useMemo(
    () => withResetBlockOnInsertBreak(withHistory(withReact(createEditor()))),
    []
  );

  const bodyOnChange = (newBody: Body) => {
    setBody(newBody);
  };

  return (
    <div elevation={1} className="RichTextEditor">
      <Container>
        <Grid
          container
          direction="column"
          justify="flex-start"
          alignItems="stretch"
          spacing={3}
        >
          <Grid item>
            <DocumentTitle
              handleEscape={(event) => {
                ReactEditor.focus(editor);
              }}
            />
          </Grid>
          <Grid item>
            <Slate editor={editor} value={body} onChange={bodyOnChange}>
              <RichTextEditorToolbar />
              <Editable
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                placeholder="Enter some text"
                spellCheck
                autoFocus
                onKeyDown={(event: KeyboardEvent) => {
                  for (const hotkey in HOTKEYS) {
                    if (isHotkey(hotkey, event)) {
                      event.preventDefault();
                      const mark = HOTKEYS[hotkey];
                      toggleMark(editor, mark);
                    }
                  }
                }}
              />
            </Slate>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default RichTextEditor;
