import FormatBoldIcon from "@material-ui/icons/FormatBold";
import FormatItalicIcon from "@material-ui/icons/FormatItalic";
import FormatUnderlinedIcon from "@material-ui/icons/FormatUnderlined";
import CodeIcon from "@material-ui/icons/Code";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import { makeStyles, withStyles } from "@material-ui/core/styles";

import LooksOneIcon from "@material-ui/icons/LooksOne";
import LooksTwoIcon from "@material-ui/icons/LooksTwo";
import Looks3Icon from "@material-ui/icons/Looks3";
import Looks4Icon from "@material-ui/icons/Looks4";
import Looks5Icon from "@material-ui/icons/Looks5";
import FormatQuoteIcon from "@material-ui/icons/FormatQuote";
import FormatListBulletedIcon from "@material-ui/icons/FormatListBulleted";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";

import {
  Toolbar,
  Grid,
  Container,
  Divider,
  Typography,
} from "@material-ui/core";

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
