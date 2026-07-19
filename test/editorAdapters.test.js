import assert from 'node:assert/strict';
import test from 'node:test';
import {
  findSupportedEditor,
  getEditorAdapterId,
  readEditorText,
  replaceEditorText,
} from '../src/content/editor.js';

class FakeEvent {
  constructor(type, options = {}) {
    this.type = type;
    Object.assign(this, options);
  }
}

function createDocument(hostname = 'example.com') {
  const selection = {
    ranges: [],
    removeAllRanges() {
      this.ranges = [];
    },
    addRange(range) {
      this.ranges.push(range);
    },
  };
  return {
    location: { hostname },
    defaultView: { Event: FakeEvent, InputEvent: FakeEvent },
    createRange() {
      return {
        collapsed: null,
        selected: null,
        selectNodeContents(element) {
          this.selected = element;
        },
        collapse(toStart) {
          this.collapsed = toStart;
        },
      };
    },
    createTextNode(text) {
      return { textContent: text };
    },
    getSelection: () => selection,
    execCommand: () => false,
    selection,
  };
}

function createElement({
  tagName = 'div',
  hostname = 'example.com',
  attributes = {},
  value = '',
  text = '',
  type = 'text',
} = {}) {
  const events = [];
  const documentRef = createDocument(hostname);
  return {
    tagName: tagName.toUpperCase(),
    id: attributes.id ?? '',
    type,
    value,
    textContent: text,
    innerText: text,
    disabled: false,
    readOnly: false,
    isContentEditable:
      attributes.contenteditable === 'true' || attributes.contenteditable === 'plaintext-only',
    ownerDocument: documentRef,
    events,
    getAttribute(name) {
      return attributes[name] ?? null;
    },
    closest() {
      return this.closestEditor ?? null;
    },
    focus() {
      this.focused = true;
    },
    dispatchEvent(event) {
      events.push(event);
      return true;
    },
    setSelectionRange(start, end) {
      this.selectionRange = [start, end];
    },
    replaceChildren(node) {
      this.textContent = node.textContent;
      this.innerText = node.textContent;
    },
  };
}

test('selects dedicated ChatGPT and Gmail adapters before the generic adapter', () => {
  const chatGpt = createElement({
    hostname: 'chatgpt.com',
    attributes: { id: 'prompt-textarea', contenteditable: 'true', role: 'textbox' },
  });
  const gmail = createElement({
    hostname: 'mail.google.com',
    attributes: { contenteditable: 'true', role: 'textbox' },
  });
  const generic = createElement({ attributes: { contenteditable: 'true' } });

  assert.equal(getEditorAdapterId(chatGpt), 'chatgpt-composer');
  assert.equal(getEditorAdapterId(gmail), 'gmail-compose');
  assert.equal(getEditorAdapterId(generic), 'generic-contenteditable');
});

test('resolves nested rich-editor event targets to their editing host', () => {
  const editor = createElement({ attributes: { contenteditable: 'true' } });
  const paragraph = createElement();
  paragraph.closestEditor = editor;

  assert.equal(findSupportedEditor(paragraph), editor);
});

test('replaces standard input text and dispatches framework-compatible events', () => {
  const input = createElement({ tagName: 'input', value: 'ami jabo na' });

  assert.equal(replaceEditorText(input, "I won't go."), true);
  assert.equal(readEditorText(input), "I won't go.");
  assert.deepEqual(
    input.events.map((event) => event.type),
    ['input', 'change'],
  );
  assert.deepEqual(input.selectionRange, [11, 11]);
});

test('replaces rich text through the safe fallback and moves the caret to the end', () => {
  const editor = createElement({
    attributes: { contenteditable: 'true' },
    text: 'ami ajke jabo na',
  });

  assert.equal(replaceEditorText(editor, "I won't go today."), true);
  assert.equal(readEditorText(editor), "I won't go today.");
  assert.deepEqual(
    editor.events.map((event) => event.type),
    ['input'],
  );
  assert.equal(editor.ownerDocument.selection.ranges.at(-1).collapsed, false);
});

test('rejects password, disabled, and read-only fields', () => {
  const password = createElement({ tagName: 'input', type: 'password' });
  const disabled = createElement({ tagName: 'textarea' });
  const readOnly = createElement({ tagName: 'input' });
  disabled.disabled = true;
  readOnly.readOnly = true;

  assert.equal(findSupportedEditor(password), null);
  assert.equal(findSupportedEditor(disabled), null);
  assert.equal(findSupportedEditor(readOnly), null);
});
