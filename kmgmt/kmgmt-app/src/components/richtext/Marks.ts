import { Editor } from "slate";
import { Mark } from "./Types";

// TODO: Implement event handling for marks: bold, italic, underline, code.

export const isMarkActive = (editor: Editor, mark: Mark) => {
  const marks = Editor.marks(editor);
  return marks ? marks[mark] === true : false;
};

export const toggleMark = (editor: Editor, mark: Mark) => {
  const isActive = isMarkActive(editor, mark);
  if (isActive) {
    Editor.removeMark(editor, mark);
  } else {
    Editor.addMark(editor, mark, true);
  }
};
