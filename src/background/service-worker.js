import { createTranslationProvider } from '../core/translation/providerFactory.js';
import { COMMANDS, DEFAULT_SETTINGS, MESSAGE_TYPES, STORAGE_KEYS } from '../shared/constants.js';
import { assertValidSourceText } from '../shared/inputPolicy.js';
import { migrateLocalSettings } from '../shared/migrations.js';
import { normalizeProtectedTerms, normalizeStylePreferences } from '../shared/preferences.js';
import { getSiteOrigin } from '../shared/siteSettings.js';

async function protectLocalSecrets() {
  await chrome.storage.local.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' });
}

async function migrateStorage() {
  const current = await chrome.storage.local.get(null);
  await chrome.storage.local.set(migrateLocalSettings(current));
}

protectLocalSecrets().catch(() => undefined);
migrateStorage().catch(() => undefined);

chrome.runtime.onInstalled.addListener(async () => {
  await protectLocalSecrets();
  await migrateStorage();
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
  if (message?.type === MESSAGE_TYPES.getTopLevelSiteContext) {
    sendResponse({ origin: getSiteOrigin(_sender.tab?.url) });
    return false;
  }
  if (message?.type !== MESSAGE_TYPES.translate) return false;

  try {
    assertValidSourceText(message.text);
  } catch (error) {
    sendResponse({ ok: false, error: { code: error.code, message: error.message } });
    return false;
  }

  chrome.storage.local
    .get([
      STORAGE_KEYS.groqApiKey,
      STORAGE_KEYS.protectedTerms,
      STORAGE_KEYS.stylePreferences,
      STORAGE_KEYS.providerId,
      STORAGE_KEYS.localModel,
    ])
    .then(async (settings) => {
      const provider = createTranslationProvider({
        providerId: settings[STORAGE_KEYS.providerId],
        groqApiKey: settings[STORAGE_KEYS.groqApiKey]?.trim(),
        localModel: settings[STORAGE_KEYS.localModel],
        protectedTerms: normalizeProtectedTerms(settings[STORAGE_KEYS.protectedTerms]),
        stylePreferences: normalizeStylePreferences(settings[STORAGE_KEYS.stylePreferences]),
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
