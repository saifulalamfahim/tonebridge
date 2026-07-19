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

export function readEditorText(element) {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)
    return element.value;
  return element.textContent ?? '';
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
  element.textContent = text;
  element.dispatchEvent(
    new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }),
  );
}
