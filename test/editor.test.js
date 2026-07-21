import assert from 'node:assert/strict';
import test from 'node:test';

class MockHTMLElement {
  constructor({ editable = false, editingHost = null } = {}) {
    this.isContentEditable = editable;
    this.editingHost = editingHost;
    this.events = [];
  }

  closest() {
    return this.editingHost;
  }

  focus() {
    this.focused = true;
  }

  dispatchEvent(event) {
    this.events.push(event);
    return true;
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
globalThis.InputEvent = class MockInputEvent {
  constructor(type, init) {
    this.type = type;
    Object.assign(this, init);
  }
};

const { findSupportedEditor, findSupportedEditorFromEvent, replaceEditorText } =
  await import('../src/content/editor.js');

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

test('finds editors hidden behind a retargeted modal event', () => {
  const editor = new MockHTMLElement({ editable: true });
  editor.editingHost = editor;
  const modalHost = new MockHTMLElement();
  const event = {
    target: modalHost,
    composedPath: () => [editor, modalHost],
  };

  assert.equal(findSupportedEditorFromEvent(event), editor);
});

test('replaces rich-editor text through the browser editing pipeline', () => {
  const editor = new MockHTMLElement({ editable: true });
  const calls = [];
  const range = {
    selectNodeContents: (element) => calls.push(['select', element]),
  };
  const selection = {
    removeAllRanges: () => calls.push(['removeRanges']),
    addRange: (selectedRange) => calls.push(['addRange', selectedRange]),
  };
  editor.ownerDocument = {
    createRange: () => range,
    getSelection: () => selection,
    execCommand: (...args) => {
      calls.push(['execCommand', ...args]);
      return true;
    },
  };

  replaceEditorText(editor, 'I am not going today.');

  assert.equal(editor.focused, true);
  assert.deepEqual(calls, [
    ['select', editor],
    ['removeRanges'],
    ['addRange', range],
    ['execCommand', 'insertText', false, 'I am not going today.'],
  ]);
  assert.equal(editor.events.length, 0);
});

test('falls back to a range replacement and leaves the caret editable', () => {
  const editor = new MockHTMLElement({ editable: true });
  const textNode = { textContent: 'I am not going today.' };
  const calls = [];
  const range = {
    selectNodeContents: () => calls.push('select'),
    deleteContents: () => calls.push('delete'),
    insertNode: (node) => calls.push(['insert', node]),
    setStartAfter: (node) => calls.push(['after', node]),
    collapse: (toStart) => calls.push(['collapse', toStart]),
  };
  const selection = {
    rangeCount: 1,
    getRangeAt: () => range,
    removeAllRanges: () => calls.push('removeRanges'),
    addRange: () => calls.push('addRange'),
  };
  editor.ownerDocument = {
    createRange: () => range,
    getSelection: () => selection,
    execCommand: () => false,
    createTextNode: () => textNode,
  };

  replaceEditorText(editor, textNode.textContent);

  assert.deepEqual(calls, [
    'select',
    'removeRanges',
    'addRange',
    'delete',
    ['insert', textNode],
    ['after', textNode],
    ['collapse', true],
    'removeRanges',
    'addRange',
  ]);
  assert.equal(editor.events.length, 1);
  assert.equal(editor.events[0].type, 'input');
  assert.equal(editor.events[0].inputType, 'insertReplacementText');
});
