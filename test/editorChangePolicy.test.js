import assert from 'node:assert/strict';
import test from 'node:test';
import { didEditorTextChange } from '../src/content/editorChangePolicy.js';

test('ignores key events that do not change the focused editor text', () => {
  const editor = {};
  assert.equal(didEditorTextChange(editor, 'same text', editor, 'same text'), false);
});

test('detects source changes and editor switches', () => {
  const first = {};
  const second = {};
  assert.equal(didEditorTextChange(first, 'before', first, 'after'), true);
  assert.equal(didEditorTextChange(first, 'same', second, 'same'), true);
});
