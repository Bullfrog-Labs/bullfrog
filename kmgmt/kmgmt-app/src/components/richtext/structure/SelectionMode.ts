import { Editor, Node, Transforms } from "slate";
import {
  rangeSpansAcrossBlocks,
  rangeToSpannedBlockPaths,
} from "./StructuralQueries";

export const convertCurrentSelectionToSectionMode = (editor: Editor) => {
  if (!editor.selection) {
    throw new Error("cannot convert null selection to section mode");
  }

  const spannedBlockPaths = rangeToSpannedBlockPaths(editor, editor.selection);

  for (const path of spannedBlockPaths) {
    Transforms.setNodes(editor, { selected: true }, { at: path });

    const node = Node.get(editor, path);
    for (const [, childPath] of Node.elements(node)) {
      Transforms.setNodes(
        editor,
        { selected: true },
        { at: path.concat(childPath) }
      );
    }
  }
};

export const enableSectionMode = (editor: Editor) => {
  if (!editor.selection) {
    throw new Error("cannot enable section mode with null selection");
  }

  // move anchor and focus to cover the sections, if they are not in the middle of the section
  // expandSelectionToCoverSections(editor);

  // mark blocks under selection as selected
  convertCurrentSelectionToSectionMode(editor);

  // TODO: unset editor selection?
  Transforms.deselect(editor);
};

export const disableSectionMode = (editor: Editor) => {
  Transforms.unsetNodes(editor, "selected", {
    mode: "all",
    at: [],
    match: () => true,
  });
};

export const handleSelectionChange = (
  editor: Editor,
  sectionModeEnabled: boolean,
  setSectionModeEnabled: (sectionModeEnabled: boolean) => void
) => {
  if (!editor.selection) {
    return;
  }

  // TODO: Handle when selection mode is already enabled and the user is trying to change the selection mode, e.g. change selection by sections.
  // TODO: Handle switching out of selection mode when a single selection is chosen, and the user makes the selection smaller (so that it no longer spans blocks)

  if (rangeSpansAcrossBlocks(editor, editor.selection)) {
    // if the selection spans multiple sections, switch to section mode.
    // TODO: is there any logic to be done when switching in, beyond setting the flag?
    if (!sectionModeEnabled) {
      setSectionModeEnabled(true);
      enableSectionMode(editor);
    }
    // mark sections as selected
    // WTFNOTE: how to get the sections?
  } else {
    // if the selection spans is in a single section, switch out of section mode.
    if (sectionModeEnabled) {
      setSectionModeEnabled(false);
      disableSectionMode(editor);
    }
  }

  // if in section mode, ensure that the appropriate sections are marked as
  // selected, and that those sections are clearly delinenated as selected.

  // if in section mode, and the focus is in the middle of a section, move it to
  // cover the entire section.
};
