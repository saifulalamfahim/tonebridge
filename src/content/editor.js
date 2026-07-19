const TEXT_INPUT_TYPES = new Set(['text', 'search', 'email', 'url']);

export function isSupportedEditor(element) {
  if (!(element instanceof HTMLElement)) return false;
  if (element instanceof HTMLTextAreaElement) return !element.disabled && !element.readOnly;
  if (element instanceof HTMLInputElement)
    return TEXT_INPUT_TYPES.has(element.type) && !element.disabled && !element.readOnly;
  return element.isContentEditable;
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
