import assert from 'node:assert/strict';
import test from 'node:test';
import { STORAGE_KEYS } from '../src/shared/constants.js';
import { migrateLocalSettings, STORAGE_SCHEMA_VERSION } from '../src/shared/migrations.js';

test('normalizes legacy local settings into the current storage schema', () => {
  const result = migrateLocalSettings({
    [STORAGE_KEYS.providerId]: 'unsupported',
    [STORAGE_KEYS.localModel]: '  llama3.2:3b  ',
    [STORAGE_KEYS.protectedTerms]: 'ToneBridge\ntonebridge',
    [STORAGE_KEYS.stylePreferences]: { spelling: 'british', contractions: 'avoid' },
  });

  assert.equal(result[STORAGE_KEYS.storageSchemaVersion], STORAGE_SCHEMA_VERSION);
  assert.equal(result[STORAGE_KEYS.providerId], 'groq');
  assert.equal(result[STORAGE_KEYS.localModel], 'llama3.2:3b');
  assert.deepEqual(result[STORAGE_KEYS.protectedTerms], ['ToneBridge']);
  assert.deepEqual(result[STORAGE_KEYS.stylePreferences], {
    spelling: 'british',
    contractions: 'avoid',
  });
});
