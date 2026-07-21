const TEXT_INPUT_TYPES = new Set(['text', 'search', 'email', 'url']);
const EDITOR_SELECTOR =
  'textarea, input, [contenteditable="true"], [contenteditable="plaintext-only"]';

export function isSupportedEditor(element) {
  if (!(element instanceof HTMLElement)) return false;
  if (element instanceof HTMLTextAreaElement) return !element.disabled && !element.readOnly;
  if (element instanceof HTMLInputElement)
    return TEXT_INPUT_TYPES.has(element.type) && !element.disabled && !element.readOnly;
  return element.isContentEditable;
}

export function findSupportedEditor(target) {
  if (!(target instanceof HTMLElement)) return null;

  if (target.isContentEditable) {
    const editingHost = target.closest?.(
      '[contenteditable="true"], [contenteditable="plaintext-only"]',
    );
    if (editingHost && isSupportedEditor(editingHost)) return editingHost;
  }

  if (isSupportedEditor(target)) return target;
  const candidate = target.closest?.(EDITOR_SELECTOR);
  return candidate && isSupportedEditor(candidate) ? candidate : null;
}

export function findSupportedEditorFromEvent(event) {
  const candidates = event.composedPath?.() ?? [event.target];
  for (const candidate of candidates) {
    const editor = findSupportedEditor(candidate);
    if (editor) return editor;
  }
  return findSupportedEditor(event.target);
}

export function readEditorText(element) {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)
    return element.value;
  return element.textContent ?? '';
}

function dispatchReplacementInput(element, text) {
  element.dispatchEvent(
    new InputEvent('input', {
      bubbles: true,
      inputType: 'insertReplacementText',
      data: text,
    }),
  );
}

function replaceContentEditableText(element, text) {
  const documentRef = element.ownerDocument ?? document;
  const selection = documentRef.getSelection?.();
  const range = documentRef.createRange?.();

  if (!selection || !range) {
    element.textContent = text;
    dispatchReplacementInput(element, text);
    return;
  }

  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);

  // Rich editors maintain their own document model. Using the browser editing
  // command preserves that model and emits the native input lifecycle, while
  // assigning textContent would destroy required paragraph/span structure.
  try {
    if (documentRef.execCommand?.('insertText', false, text)) return;
  } catch {
    // Fall through to a range-based replacement for editors/browsers that do
    // not implement insertText through execCommand.
  }

  const activeRange = selection.rangeCount > 0 ? selection.getRangeAt(0) : range;
  activeRange.deleteContents();
  const textNode = documentRef.createTextNode(text);
  activeRange.insertNode(textNode);
  activeRange.setStartAfter(textNode);
  activeRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(activeRange);
  dispatchReplacementInput(element, text);
}

export function replaceEditorText(element, text) {
  element.focus();
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    const prototype =
      element instanceof HTMLInputElement
        ? HTMLInputElement.prototype
        : HTMLTextAreaElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(element, text);
    element.dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }),
    );
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.setSelectionRange(text.length, text.length);
    return;
  }
  replaceContentEditableText(element, text);
}
