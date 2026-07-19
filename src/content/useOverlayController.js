import { useCallback, useEffect, useRef, useState } from 'react';
import { ExtensionTranslationProvider } from '../core/translation/ExtensionTranslationProvider.js';
import {
  DEFAULT_SETTINGS,
  MESSAGE_TYPES,
  SITE_MODES,
  STORAGE_KEYS,
  TRANSLATION_DELAY_MS,
  TRANSLATION_MODES,
} from '../shared/constants.js';
import { getEffectiveTranslationMode, getSiteMode, getSiteOrigin } from '../shared/siteSettings.js';
import {
  findSupportedEditor,
  findSupportedEditorFromEvent,
  readEditorText,
  replaceEditorText,
} from './editor.js';
import { didEditorTextChange } from './editorChangePolicy.js';

const provider = new ExtensionTranslationProvider();
const frameOrigin = getSiteOrigin(window.location.href);

async function getTopLevelOrigin() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.getTopLevelSiteContext,
    });
    return response?.origin ?? frameOrigin;
  } catch {
    return frameOrigin;
  }
}
const INITIAL_STATE = {
  visible: false,
  loading: false,
  result: null,
  rect: null,
  applied: false,
  copied: false,
  placementId: 0,
  originalText: '',
  appliedTranslation: '',
};

export function useOverlayController() {
  const [state, setState] = useState(INITIAL_STATE);
  const editorRef = useRef(null);
  const observedEditorRef = useRef(null);
  const observedTextRef = useRef('');
  const debounceTimerRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const requestIdRef = useRef(0);
  const suppressNextInputRef = useRef(false);
  const settingsReadyRef = useRef(false);
  const enabledRef = useRef(true);
  const globalModeRef = useRef(TRANSLATION_MODES.automatic);
  const siteModesRef = useRef({});
  const effectiveModeRef = useRef(TRANSLATION_MODES.automatic);
  const siteOriginRef = useRef(frameOrigin);
  const cacheRef = useRef(new Map());
  const placementIdRef = useRef(0);

  const rememberEditor = useCallback((candidate) => {
    const editor = findSupportedEditor(candidate);
    if (!editor || editorRef.current === editor) return editor;
    editorRef.current = editor;
    placementIdRef.current += 1;
    return editor;
  }, []);

  const hide = useCallback(() => {
    clearTimeout(debounceTimerRef.current);
    clearTimeout(feedbackTimerRef.current);
    requestIdRef.current += 1;
    setState((current) => ({ ...current, visible: false, loading: false }));
  }, []);

  const reposition = useCallback(() => {
    if (editorRef.current?.isConnected)
      setState((current) => ({ ...current, rect: editorRef.current.getBoundingClientRect() }));
  }, []);

  const translate = useCallback(async (text, editor, { refresh = false } = {}) => {
    const requestId = ++requestIdRef.current;
    const cache = cacheRef.current;
    const cachedResult = refresh ? null : cache.get(text);

    setState((current) => ({
      ...current,
      visible: true,
      loading: !cachedResult,
      result: cachedResult,
      applied: false,
      copied: false,
      placementId: placementIdRef.current,
      rect: editor.getBoundingClientRect(),
    }));
    if (cachedResult) return;

    const result = await provider.translate(text);
    if (requestId !== requestIdRef.current || !editor.isConnected) return;
    if (readEditorText(editor).trim() !== text) return;

    if (result.translation) {
      cache.set(text, result);
      if (cache.size > 50) cache.delete(cache.keys().next().value);
    }
    setState((current) => ({
      ...current,
      visible: true,
      loading: false,
      result,
      rect: editor.getBoundingClientRect(),
    }));
  }, []);

  useEffect(() => {
    Promise.all([chrome.storage.sync.get(DEFAULT_SETTINGS), getTopLevelOrigin()]).then(
      ([settings, topLevelOrigin]) => {
        siteOriginRef.current = topLevelOrigin;
        enabledRef.current = settings[STORAGE_KEYS.enabled];
        globalModeRef.current = settings[STORAGE_KEYS.translationMode];
        siteModesRef.current = settings[STORAGE_KEYS.siteModes];
        effectiveModeRef.current = getEffectiveTranslationMode(
          globalModeRef.current,
          getSiteMode(siteModesRef.current, siteOriginRef.current),
        );
        settingsReadyRef.current = true;
      },
    );
    const onStorage = (changes, area) => {
      if (area !== 'sync') return;
      let modeChanged = false;
      if (changes[STORAGE_KEYS.enabled]) {
        enabledRef.current = changes[STORAGE_KEYS.enabled].newValue;
        if (!enabledRef.current) hide();
      }
      if (changes[STORAGE_KEYS.translationMode]) {
        globalModeRef.current = changes[STORAGE_KEYS.translationMode].newValue;
        modeChanged = true;
      }
      if (changes[STORAGE_KEYS.siteModes]) {
        siteModesRef.current = changes[STORAGE_KEYS.siteModes].newValue ?? {};
        modeChanged = true;
      }
      if (modeChanged) {
        effectiveModeRef.current = getEffectiveTranslationMode(
          globalModeRef.current,
          getSiteMode(siteModesRef.current, siteOriginRef.current),
        );
        if (effectiveModeRef.current !== TRANSLATION_MODES.automatic) hide();
      }
    };
    const onFocusIn = (event) => {
      const editor = rememberEditor(findSupportedEditorFromEvent(event));
      if (!editor) return;
      observedEditorRef.current = editor;
      observedTextRef.current = readEditorText(editor).trim();
    };
    const onEditorChange = (event) => {
      const editor = findSupportedEditorFromEvent(event);
      if (!editor) return;
      const text = readEditorText(editor).trim();
      const textChanged = didEditorTextChange(
        observedEditorRef.current,
        observedTextRef.current,
        editor,
        text,
      );
      observedEditorRef.current = editor;
      observedTextRef.current = text;
      if (suppressNextInputRef.current) {
        suppressNextInputRef.current = false;
        return;
      }
      if (!textChanged || !settingsReadyRef.current || !enabledRef.current) return;
      if (effectiveModeRef.current === SITE_MODES.disabled) return hide();
      rememberEditor(editor);
      clearTimeout(debounceTimerRef.current);
      clearTimeout(feedbackTimerRef.current);
      requestIdRef.current += 1;
      if (!text) return hide();
      if (effectiveModeRef.current === TRANSLATION_MODES.manual) {
        setState((current) => ({ ...current, visible: false, loading: false }));
        return;
      }

      setState({
        ...INITIAL_STATE,
        visible: true,
        loading: true,
        placementId: placementIdRef.current,
        rect: editor.getBoundingClientRect(),
      });
      debounceTimerRef.current = setTimeout(() => translate(text, editor), TRANSLATION_DELAY_MS);
    };
    const onKeydown = (event) => {
      if (event.key === 'Escape') hide();
    };
    const onRuntimeMessage = (message, _sender, sendResponse) => {
      if (message?.type === MESSAGE_TYPES.getSiteContext) {
        sendResponse({ origin: siteOriginRef.current });
        return false;
      }
      if (
        message?.type !== MESSAGE_TYPES.translateFocusedEditor ||
        !settingsReadyRef.current ||
        !enabledRef.current ||
        effectiveModeRef.current === SITE_MODES.disabled
      )
        return false;
      const activeEditor = findSupportedEditor(document.activeElement) ?? editorRef.current;
      if (!activeEditor?.isConnected || !findSupportedEditor(activeEditor)) return false;

      rememberEditor(activeEditor);
      const text = readEditorText(activeEditor).trim();
      observedEditorRef.current = activeEditor;
      observedTextRef.current = text;
      clearTimeout(debounceTimerRef.current);
      clearTimeout(feedbackTimerRef.current);
      requestIdRef.current += 1;
      if (!text) return false;
      translate(text, activeEditor);
      return false;
    };
    document.addEventListener('focusin', onFocusIn, true);
    document.addEventListener('input', onEditorChange, true);
    document.addEventListener('keyup', onEditorChange, true);
    document.addEventListener('keydown', onKeydown, true);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    chrome.storage.onChanged.addListener(onStorage);
    chrome.runtime.onMessage.addListener(onRuntimeMessage);
    return () => {
      clearTimeout(debounceTimerRef.current);
      clearTimeout(feedbackTimerRef.current);
      document.removeEventListener('focusin', onFocusIn, true);
      document.removeEventListener('input', onEditorChange, true);
      document.removeEventListener('keyup', onEditorChange, true);
      document.removeEventListener('keydown', onKeydown, true);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
      chrome.storage.onChanged.removeListener(onStorage);
      chrome.runtime.onMessage.removeListener(onRuntimeMessage);
    };
  }, [hide, rememberEditor, reposition, translate]);

  const accept = useCallback(() => {
    const editor = editorRef.current;
    const translation = state.result?.translation;
    if (!editor || !translation) return;
    const originalText = readEditorText(editor);
    suppressNextInputRef.current = true;
    replaceEditorText(editor, translation);
    clearTimeout(feedbackTimerRef.current);
    setState((current) => ({
      ...current,
      applied: true,
      copied: false,
      originalText,
      appliedTranslation: translation,
      rect: editor.getBoundingClientRect(),
    }));
    feedbackTimerRef.current = setTimeout(hide, 8_000);
  }, [hide, state.result]);

  const undo = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || readEditorText(editor) !== state.appliedTranslation) return hide();
    suppressNextInputRef.current = true;
    replaceEditorText(editor, state.originalText);
    hide();
  }, [hide, state.appliedTranslation, state.originalText]);

  const copy = useCallback(async () => {
    const translation = state.result?.translation;
    if (!translation) return;
    try {
      await navigator.clipboard.writeText(translation);
      setState((current) => ({ ...current, copied: true }));
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(
        () => setState((current) => ({ ...current, copied: false })),
        2_000,
      );
    } catch {
      setState((current) => ({
        ...current,
        result: { ...current.result, message: 'Copy failed. Select the translation manually.' },
      }));
    }
  }, [state.result]);

  const retry = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const text = readEditorText(editor).trim();
    if (text) translate(text, editor, { refresh: true });
  }, [translate]);

  return { ...state, accept, copy, hide, retry, undo };
}
