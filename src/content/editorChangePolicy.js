export function didEditorTextChange(previousEditor, previousText, editor, currentText) {
  return previousEditor !== editor || previousText !== currentText;
}
