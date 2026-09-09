import { readEditorText, replaceEditorText, findSupportedEditor } from '../src/content/editor.js';
const output = document.querySelector('#result');
let target = document.querySelector('#rich');
let original = '';
document.addEventListener('focusin', (event) => {
  const editor = findSupportedEditor(event.target);
  if (editor) target = editor;
});
document.querySelector('#replace').onclick = () => {
  original = readEditorText(target);
  try {
    replaceEditorText(target, "I won't go today.\nI have work tomorrow.");
    output.textContent = 'Replacement complete. Try editing, selecting, copying, and deleting.';
  } catch (error) {
    output.textContent = error.message;
  }
};
document.querySelector('#undo').onclick = () => replaceEditorText(target, original);
document.querySelector('#suite').onclick = () => {
  const results = [];
  const check = (name, action) => {
    try {
      action();
      results.push(`PASS: ${name}`);
    } catch (error) {
      results.push(`FAIL: ${name}: ${error.message}`);
    }
  };
  const equal = (a, b) => {
    if (a !== b) throw new Error(`${JSON.stringify(a)} != ${JSON.stringify(b)}`);
  };
  for (const id of ['plain', 'area', 'email', 'rich']) {
    check(`${id}: replace, edit, delete, restore`, () => {
      const editor = document.getElementById(id);
      const before = readEditorText(editor);
      replaceEditorText(editor, 'English result');
      equal(readEditorText(editor), 'English result');
      replaceEditorText(editor, 'Edited result');
      equal(readEditorText(editor), 'Edited result');
      replaceEditorText(editor, '');
      equal(readEditorText(editor), '');
      replaceEditorText(editor, before);
      equal(readEditorText(editor), before);
    });
  }
  check('rich editor: paragraph boundaries remain readable', () => {
    const editor = document.getElementById('rich');
    replaceEditorText(editor, 'First paragraph\nSecond paragraph');
    equal(readEditorText(editor), 'First paragraph\nSecond paragraph');
  });
  check('password and readonly fields excluded', () => {
    const field = document.createElement('input');
    field.type = 'password';
    equal(findSupportedEditor(field), null);
    field.type = 'text';
    field.readOnly = true;
    equal(findSupportedEditor(field), null);
  });
  output.textContent = results.join('\n');
};
