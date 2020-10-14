import React, { FunctionComponent } from "react";

import FormatBoldIcon from "@material-ui/icons/FormatBold";
import FormatItalicIcon from "@material-ui/icons/FormatItalic";
import FormatUnderlinedIcon from "@material-ui/icons/FormatUnderlined";
import CodeIcon from "@material-ui/icons/Code";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import { makeStyles, withStyles } from "@material-ui/core/styles";

import ViewHeadlineIcon from "@material-ui/icons/ViewHeadline";
import LooksOneIcon from "@material-ui/icons/LooksOne";
import LooksTwoIcon from "@material-ui/icons/LooksTwo";
import Looks3Icon from "@material-ui/icons/Looks3";
import Looks4Icon from "@material-ui/icons/Looks4";
import Looks5Icon from "@material-ui/icons/Looks5";
import FormatQuoteIcon from "@material-ui/icons/FormatQuote";
import FormatListBulletedIcon from "@material-ui/icons/FormatListBulleted";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";

import { CgMoveLeft, CgMoveRight } from "react-icons/cg";

import { Toolbar, Divider, Button, ButtonGroup } from "@material-ui/core";
import { useSlate, ReactEditor, useEditor } from "slate-react";
import {
  MARKS,
  Mark,
  BLOCKS,
  Block,
  StructureAction,
  StructureMode,
} from "./Types";
import { isMarkActive } from "./Marks";
import { Editor } from "slate";
import { toReactMouseEventHandler } from "./EventHandling";
import { isBlockActive, toggleBlock } from "./Blocks";
import { RichTextEditorProps } from "./RichTextEditor";
import { denestBlock, nestSection } from "./Structure";

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

const MarkButtonGroup = () => {
  const editor = useSlate();

  const getActiveMarks = () => {
    return MARKS.filter((x) => isMarkActive(editor, x));
  };

  const handleMark = (event: MouseEvent, newMarks: Mark[]) => {
    event.preventDefault();

    // Handle update to formats
    const newlyActiveMarks = newMarks.filter((x) => !isMarkActive(editor, x));
    const newlyInactiveMarks = getActiveMarks().filter(
      (x) => !newMarks.includes(x)
    );

    for (let format of newlyActiveMarks) {
      Editor.addMark(editor, format, true);
    }

    for (let format of newlyInactiveMarks) {
      Editor.removeMark(editor, format);
    }

    // Need to move focus back to editor to keep the selection.
    ReactEditor.focus(editor);
  };

  return (
    <StyledToggleButtonGroup
      size="small"
      value={getActiveMarks()}
      onChange={toReactMouseEventHandler(handleMark)}
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

const StyledButtonGroup = withStyles((theme) => ({
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
}))(ButtonGroup);

const BlockButtonGroup = () => {
  const editor = useSlate();
  const activeBlocks = BLOCKS.filter((x) => isBlockActive(editor, x));
  const activeBlock = activeBlocks.length === 1 ? activeBlocks[0] : null;

  const handleBlock = (event: MouseEvent, newBlock: Block) => {
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
      onChange={toReactMouseEventHandler(handleBlock)}
      aria-label="block type selection"
    >
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

export type StructureButtonGroupProps = {
  structureMode: StructureMode;
  onStructureModeChange: (newStructureMode: StructureMode) => void;
};

const StructureButtonGroup: FunctionComponent<StructureButtonGroupProps> = ({
  structureMode,
  onStructureModeChange,
}) => {
  const outlineModeActive = structureMode === "outline-mode";
  const editor = useSlate();

  const handleDenestBlock = () => {
    // event.preventDefault();
    denestBlock(editor);
    ReactEditor.focus(editor);
  };

  const handleNestSelection = () => {
    // event.preventDefault();
    nestSection(editor);
    ReactEditor.focus(editor);
  };

  const handleToggleOutlineMode = () => {
    // check structure mode, and change it
    const newStructureMode =
      structureMode === "edit-mode" ? "outline-mode" : "edit-mode"; // flip between the two modes
    // let parent components know that structure mode changed
    onStructureModeChange(newStructureMode);
  };

  // TODO: Fix CSS issues with the button sizes and colors
  return (
    <StyledButtonGroup>
      <Button onClick={handleDenestBlock} aria-label="denest-block">
        <CgMoveLeft size={24} />
      </Button>
      <Button onClick={handleNestSelection} aria-label="nest-section">
        <CgMoveRight size={24} />
      </Button>
      <ToggleButton
        value="outline-mode"
        aria-label="outline-mode"
        selected={outlineModeActive}
        onChange={handleToggleOutlineMode}
      >
        <ViewHeadlineIcon />
      </ToggleButton>
    </StyledButtonGroup>
  );
};

export type RichTextEditorToolbarProps = {
  structureMode: StructureMode;
  onStructureModeChange: (newStructureMode: StructureMode) => void;
};

const RichTextEditorToolbar: FunctionComponent<RichTextEditorToolbarProps> = ({
  structureMode,
  onStructureModeChange,
}) => {
  const classes = useStyles();

  return (
    <Toolbar>
      <MarkButtonGroup />
      <Divider flexItem orientation="vertical" className={classes.divider} />
      <StructureButtonGroup
        structureMode={structureMode}
        onStructureModeChange={onStructureModeChange}
      />
      <Divider flexItem orientation="vertical" className={classes.divider} />
      <BlockButtonGroup />
    </Toolbar>
  );
};

export default RichTextEditorToolbar;
