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
import { isSupportedEditor, readEditorText, replaceEditorText } from './editor.js';

const provider = new ExtensionTranslationProvider();
const siteOrigin = getSiteOrigin(window.location.href);
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
  const debounceTimerRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const requestIdRef = useRef(0);
  const suppressNextInputRef = useRef(false);
  const settingsReadyRef = useRef(false);
  const enabledRef = useRef(true);
  const globalModeRef = useRef(TRANSLATION_MODES.automatic);
  const siteModesRef = useRef({});
  const effectiveModeRef = useRef(TRANSLATION_MODES.automatic);
  const cacheRef = useRef(new Map());
  const placementIdRef = useRef(0);

  const rememberEditor = useCallback((editor) => {
    if (!isSupportedEditor(editor) || editorRef.current === editor) return false;
    editorRef.current = editor;
    placementIdRef.current += 1;
    return true;
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
    chrome.storage.sync.get(DEFAULT_SETTINGS).then((settings) => {
      enabledRef.current = settings[STORAGE_KEYS.enabled];
      globalModeRef.current = settings[STORAGE_KEYS.translationMode];
      siteModesRef.current = settings[STORAGE_KEYS.siteModes];
      effectiveModeRef.current = getEffectiveTranslationMode(
        globalModeRef.current,
        getSiteMode(siteModesRef.current, siteOrigin),
      );
      settingsReadyRef.current = true;
    });
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
          getSiteMode(siteModesRef.current, siteOrigin),
        );
        if (effectiveModeRef.current !== TRANSLATION_MODES.automatic) hide();
      }
    };
    const onFocusIn = (event) => rememberEditor(event.target);
    const onInput = (event) => {
      if (suppressNextInputRef.current) {
        suppressNextInputRef.current = false;
        return;
      }
      if (!settingsReadyRef.current || !enabledRef.current || !isSupportedEditor(event.target))
        return;
      if (effectiveModeRef.current === SITE_MODES.disabled) return hide();
      rememberEditor(event.target);
      const text = readEditorText(event.target).trim();
      clearTimeout(debounceTimerRef.current);
      clearTimeout(feedbackTimerRef.current);
      requestIdRef.current += 1;
      if (!text) return hide();
      if (effectiveModeRef.current === TRANSLATION_MODES.manual) {
        setState((current) => ({ ...current, visible: false, loading: false }));
        return;
      }

      const editor = event.target;
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
        sendResponse({ origin: siteOrigin });
        return false;
      }
      if (
        message?.type !== MESSAGE_TYPES.translateFocusedEditor ||
        !settingsReadyRef.current ||
        !enabledRef.current ||
        effectiveModeRef.current === SITE_MODES.disabled
      )
        return false;
      const activeEditor = isSupportedEditor(document.activeElement)
        ? document.activeElement
        : editorRef.current;
      if (!activeEditor?.isConnected || !isSupportedEditor(activeEditor)) return false;

      rememberEditor(activeEditor);
      const text = readEditorText(activeEditor).trim();
      clearTimeout(debounceTimerRef.current);
      clearTimeout(feedbackTimerRef.current);
      requestIdRef.current += 1;
      if (!text) return false;
      translate(text, activeEditor);
      return false;
    };
    document.addEventListener('focusin', onFocusIn, true);
    document.addEventListener('input', onInput, true);
    document.addEventListener('keydown', onKeydown, true);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    chrome.storage.onChanged.addListener(onStorage);
    chrome.runtime.onMessage.addListener(onRuntimeMessage);
    return () => {
      clearTimeout(debounceTimerRef.current);
      clearTimeout(feedbackTimerRef.current);
      document.removeEventListener('focusin', onFocusIn, true);
      document.removeEventListener('input', onInput, true);
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
