import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../shared/constants.js';
import { MESSAGE_TYPES } from '../shared/constants.js';
import { GroqTranslationProvider } from '../core/translation/GroqTranslationProvider.js';

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.sync.get(STORAGE_KEYS.enabled);
  if (current[STORAGE_KEYS.enabled] === undefined) await chrome.storage.sync.set(DEFAULT_SETTINGS);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== MESSAGE_TYPES.translate) return false;

  chrome.storage.local
    .get(STORAGE_KEYS.groqApiKey)
    .then(async (settings) => {
      const provider = new GroqTranslationProvider({
        apiKey: settings[STORAGE_KEYS.groqApiKey]?.trim(),
      });
      const result = await provider.translate(message.text);
      sendResponse({ ok: true, result });
    })
    .catch((error) => {
      sendResponse({
        ok: false,
        error: {
          code: error.code ?? 'UNKNOWN_ERROR',
          message: error.message ?? 'Translation failed.',
        },
      });
    });

  return true;
});
