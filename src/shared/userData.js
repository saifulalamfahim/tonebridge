import { DEFAULT_SETTINGS, STORAGE_KEYS } from './constants.js';
import { normalizeProtectedTerms, normalizeStylePreferences } from './preferences.js';

export const USER_DATA_EXPORT_VERSION = 1;

export function createUserDataExport({ syncSettings, protectedTerms, stylePreferences, now }) {
  return {
    format: 'tonebridge-settings',
    version: USER_DATA_EXPORT_VERSION,
    exportedAt: (now ?? new Date()).toISOString(),
    settings: {
      enabled: syncSettings?.[STORAGE_KEYS.enabled] ?? DEFAULT_SETTINGS[STORAGE_KEYS.enabled],
      translationMode:
        syncSettings?.[STORAGE_KEYS.translationMode] ??
        DEFAULT_SETTINGS[STORAGE_KEYS.translationMode],
      siteModes: syncSettings?.[STORAGE_KEYS.siteModes] ?? DEFAULT_SETTINGS[STORAGE_KEYS.siteModes],
      protectedTerms: normalizeProtectedTerms(protectedTerms),
      style: normalizeStylePreferences(stylePreferences),
    },
  };
}
