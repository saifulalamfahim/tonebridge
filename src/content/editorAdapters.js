const TEXT_INPUT_TYPES = new Set(['text', 'search', 'email', 'url']);
const RICH_EDITOR_SELECTOR = '[contenteditable="true"], [contenteditable="plaintext-only"]';

function getTagName(element) {
  return element?.tagName?.toLowerCase?.() ?? '';
}

function isDisabled(element) {
  return Boolean(element?.disabled || element?.readOnly);
}

function isStandardInput(element) {
  const tagName = getTagName(element);
  if (tagName === 'textarea') return !isDisabled(element);
  if (tagName !== 'input') return false;
  return TEXT_INPUT_TYPES.has((element.type || 'text').toLowerCase()) && !isDisabled(element);
}

function isRichEditor(element) {
  if (!element || isDisabled(element)) return false;
  const editable = element.getAttribute?.('contenteditable');
  return editable === 'true' || editable === 'plaintext-only';
}

function getHostname(element, hostname) {
  return (
    hostname ??
    element?.ownerDocument?.location?.hostname ??
    globalThis.location?.hostname ??
    ''
  ).toLowerCase();
}

function createInputEvent(element, text) {
  const view = element.ownerDocument?.defaultView ?? globalThis;
  if (typeof view.InputEvent === 'function')
    return new view.InputEvent('input', {
      bubbles: true,
      inputType: 'insertText',
      data: text,
    });
  return new view.Event('input', { bubbles: true });
}

function replaceStandardInput(element, text) {
  element.focus();
  const view = element.ownerDocument?.defaultView ?? globalThis;
  const prototype =
    getTagName(element) === 'input'
      ? view.HTMLInputElement?.prototype
      : view.HTMLTextAreaElement?.prototype;
  Object.getOwnPropertyDescriptor(prototype ?? {}, 'value')?.set?.call(element, text);
  if (element.value !== text) element.value = text;
  element.dispatchEvent(createInputEvent(element, text));
  element.dispatchEvent(new view.Event('change', { bubbles: true }));
  element.setSelectionRange?.(text.length, text.length);
}

function selectEditorContents(element) {
  const documentRef = element.ownerDocument;
  const selection = documentRef?.getSelection?.();
  if (!selection || !documentRef?.createRange) return null;
  const range = documentRef.createRange();
  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);
  return selection;
}

function moveCaretToEnd(element, selection = element.ownerDocument?.getSelection?.()) {
  const documentRef = element.ownerDocument;
  if (!selection || !documentRef?.createRange) return;
  const range = documentRef.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function replaceRichEditor(element, text) {
  element.focus();
  const documentRef = element.ownerDocument;
  const selection = selectEditorContents(element);
  let inserted = false;

  if (typeof documentRef?.execCommand === 'function') {
    try {
      inserted = documentRef.execCommand('insertText', false, text) === true;
    } catch {
      inserted = false;
    }
  }

  if (!inserted) {
    if (typeof element.replaceChildren === 'function' && documentRef?.createTextNode)
      element.replaceChildren(documentRef.createTextNode(text));
    else element.textContent = text;
    element.dispatchEvent(createInputEvent(element, text));
  }

  moveCaretToEnd(element, selection);
}

function readRichEditor(element) {
  return typeof element.innerText === 'string' ? element.innerText : (element.textContent ?? '');
}

const standardInputAdapter = {
  id: 'standard-input',
  matches: (element) => isStandardInput(element),
  read: (element) => element.value ?? '',
  replace: replaceStandardInput,
};

const chatGptAdapter = {
  id: 'chatgpt-composer',
  matches: (element, context) => {
    const hostname = getHostname(element, context.hostname);
    return (
      ['chatgpt.com', 'chat.openai.com'].includes(hostname) &&
      isRichEditor(element) &&
      (element.id === 'prompt-textarea' || element.getAttribute?.('role') === 'textbox')
    );
  },
  read: readRichEditor,
  replace: replaceRichEditor,
};

const gmailAdapter = {
  id: 'gmail-compose',
  matches: (element, context) => {
    const hostname = getHostname(element, context.hostname);
    return (
      hostname === 'mail.google.com' &&
      isRichEditor(element) &&
      element.getAttribute?.('role') === 'textbox'
    );
  },
  read: readRichEditor,
  replace: replaceRichEditor,
};

const genericRichTextAdapter = {
  id: 'generic-contenteditable',
  matches: (element) => isRichEditor(element),
  read: readRichEditor,
  replace: replaceRichEditor,
};

export const EDITOR_ADAPTERS = [
  chatGptAdapter,
  gmailAdapter,
  standardInputAdapter,
  genericRichTextAdapter,
];

export function resolveEditorElement(target) {
  if (!target) return null;
  if (isStandardInput(target) || isRichEditor(target)) return target;
  const candidate = target.closest?.(`input, textarea, ${RICH_EDITOR_SELECTOR}`);
  return isStandardInput(candidate) || isRichEditor(candidate) ? candidate : null;
}

export function resolveEditorAdapter(target, context = {}) {
  const element = resolveEditorElement(target);
  if (!element) return null;
  const adapter = EDITOR_ADAPTERS.find((candidate) => candidate.matches(element, context));
  return adapter ? { adapter, element } : null;
}
