import assert from 'node:assert/strict';
import test from 'node:test';

class MockHTMLElement {
  constructor({ editable = false, editingHost = null } = {}) {
    this.isContentEditable = editable;
    this.editingHost = editingHost;
  }

  closest() {
    return this.editingHost;
  }
}

class MockInputElement extends MockHTMLElement {
  constructor() {
    super();
    this.type = 'text';
    this.disabled = false;
    this.readOnly = false;
  }
}

class MockTextAreaElement extends MockHTMLElement {
  constructor() {
    super();
    this.disabled = false;
    this.readOnly = false;
  }
}

globalThis.HTMLElement = MockHTMLElement;
globalThis.HTMLInputElement = MockInputElement;
globalThis.HTMLTextAreaElement = MockTextAreaElement;

const { findSupportedEditor } = await import('../src/content/editor.js');

test('resolves nested contenteditable targets to their real editing host', () => {
  const editor = new MockHTMLElement({ editable: true });
  editor.editingHost = editor;
  const paragraph = new MockHTMLElement({ editable: true, editingHost: editor });

  assert.equal(findSupportedEditor(paragraph), editor);
});

test('keeps standard form controls as their own editor', () => {
  const input = new MockInputElement();
  assert.equal(findSupportedEditor(input), input);
});
