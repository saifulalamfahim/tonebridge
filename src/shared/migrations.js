import { STORAGE_KEYS } from './constants.js';
import {
  normalizeLocalModel,
  normalizeProtectedTerms,
  normalizeProviderId,
  normalizeStylePreferences,
} from './preferences.js';

export const STORAGE_SCHEMA_VERSION = 1;

export function migrateLocalSettings(current = {}) {
  return {
    [STORAGE_KEYS.storageSchemaVersion]: STORAGE_SCHEMA_VERSION,
    [STORAGE_KEYS.providerId]: normalizeProviderId(current[STORAGE_KEYS.providerId]),
    [STORAGE_KEYS.localModel]: normalizeLocalModel(current[STORAGE_KEYS.localModel]),
    [STORAGE_KEYS.protectedTerms]: normalizeProtectedTerms(current[STORAGE_KEYS.protectedTerms]),
    [STORAGE_KEYS.stylePreferences]: normalizeStylePreferences(
      current[STORAGE_KEYS.stylePreferences],
    ),
  };
}
