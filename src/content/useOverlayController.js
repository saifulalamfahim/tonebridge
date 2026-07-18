import { useCallback, useEffect, useRef, useState } from 'react';
import { ExtensionTranslationProvider } from '../core/translation/ExtensionTranslationProvider.js';
import { DEFAULT_SETTINGS, STORAGE_KEYS, TRANSLATION_DELAY_MS } from '../shared/constants.js';
import { isSupportedEditor, readEditorText, replaceEditorText } from './editor.js';

const provider = new ExtensionTranslationProvider();
const INITIAL_STATE = {
  visible: false,
  loading: false,
  result: null,
  rect: null,
  applied: false,
  copied: false,
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
  const enabledRef = useRef(true);
  const cacheRef = useRef(new Map());

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
    });
    const onStorage = (changes, area) => {
      if (area !== 'sync' || !changes[STORAGE_KEYS.enabled]) return;
      enabledRef.current = changes[STORAGE_KEYS.enabled].newValue;
      if (!enabledRef.current) hide();
    };
    const onInput = (event) => {
      if (suppressNextInputRef.current) {
        suppressNextInputRef.current = false;
        return;
      }
      if (!enabledRef.current || !isSupportedEditor(event.target)) return;
      editorRef.current = event.target;
      const text = readEditorText(event.target).trim();
      clearTimeout(debounceTimerRef.current);
      clearTimeout(feedbackTimerRef.current);
      requestIdRef.current += 1;
      if (!text) return hide();

      const editor = event.target;
      setState({
        ...INITIAL_STATE,
        visible: true,
        loading: true,
        rect: editor.getBoundingClientRect(),
      });
      debounceTimerRef.current = setTimeout(() => translate(text, editor), TRANSLATION_DELAY_MS);
    };
    const onKeydown = (event) => {
      if (event.key === 'Escape') hide();
    };
    document.addEventListener('input', onInput, true);
    document.addEventListener('keydown', onKeydown, true);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    chrome.storage.onChanged.addListener(onStorage);
    return () => {
      clearTimeout(debounceTimerRef.currmxã›h‘éì¶»§q«^t  };
    } catch {
      return { translation: '', message: 'ToneBridge could not reach its background service.' };
    }
  }
}
