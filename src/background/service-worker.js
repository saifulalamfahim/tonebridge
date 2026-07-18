import { GroqTranslationProvider } from '../core/translation/GroqTranslationProvider.js';
import { COMMANDS, DEFAULT_SETTINGS, MESSAGE_TYPES, STORAGE_KEYS } from '../shared/constants.js';

chrome.runtime.onInstalled.addListener(async () => {
  const keys = Object.keys(DEFAULT_SETTINGS);
  const current = await chrome.storage.sync.get(keys);
  const missing = Object.fromEntries(
    Object.entries(DEFAULT_SETTINGS).filter(([key]) => current[key] === undefined),
  );
  if (Object.keys(missing).length) await chrome.storage.sync.set(missing);
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== COMMANDS.translateFocusedEditor) return;
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab?.id) return;
  await chrome.tabs
    .sendMessage(tab.id, { type: MESSAGE_TYPES.translateFocusedEditor })
    .catch(() => undefined);
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
