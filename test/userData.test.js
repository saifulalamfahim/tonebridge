import assert from 'node:assert/strict';
import test from 'node:test';
import { STORAGE_KEYS } from '../src/shared/constants.js';
import { createUserDataExport } from '../src/shared/userData.js';

test('exports inspectable settings without API credentials', () => {
  const result = createUserDataExport({
    syncSettings: {
      [STORAGE_KEYS.enabled]: false,
      [STORAGE_KEYS.translationMode]: 'manual',
      [STORAGE_KEYS.siteModes]: { 'https://example.com': 'disabled' },
    },
    protectedTerms: ['ToneBridge'],
    stylePreferences: { spelling: 'british', contractions: 'prefer' },
    now: new Date('2026-07-19T00:00:00.000Z'),
  });

  assert.equal(result.version, 1);
  assert.equal(result.exportedAt, '2026-07-19T00:00:00.000Z');
  assert.deepEqual(result.settings.protectedTerms, ['ToneBridge']);
  assert.equal(result.settings.style.spelling, 'british');
  assert.doesNotMatch(JSON.stringify(result), /api.?key|gsk_/i);
});
