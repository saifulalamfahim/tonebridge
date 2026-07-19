import { resolveEditorAdapter, resolveEditorElement } from './editorAdapters.js';

export function isSupportedEditor(element) {
  return resolveEditorElement(element) === element && Boolean(resolveEditorAdapter(element));
}

export function findSupportedEditor(target) {
  return resolveEditorElement(target);
}

export function getEditorAdapterId(element) {
  return resolveEditorAdapter(element)?.adapter.id ?? null;
}

export function readEditorText(element) {
  const descriptor = resolveEditorAdapter(element);
  return descriptor ? descriptor.adapter.read(descriptor.element) : '';
}

export function replaceEditorText(element, text) {
  const descriptor = resolveEditorAdapter(element);
  if (!descriptor) return false;
  descriptor.adapter.replace(descriptor.element, text);
  return true;
}
