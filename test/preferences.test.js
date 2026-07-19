import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MAX_PROTECTED_TERMS,
  normalizeLocalModel,
  normalizeProtectedTerms,
  normalizeProviderId,
  normalizeStylePreferences,
} from '../src/shared/preferences.js';

test('normalizes protected terms without changing accepted spelling', () => {
  assert.deepEqual(
    normalizeProtectedTerms(' ToneBridge \nReact 19\ntonebridge\n\nSaiful Alam Fahim'),
    ['ToneBridge', 'React 19', 'Saiful Alam Fahim'],
  );
});

test('normalizes provider settings to supported local values', () => {
  assert.equal(normalizeProviderId('local'), 'local');
  assert.equal(normalizeProviderId('unknown'), 'groq');
  assert.equal(normalizeLocalModel('  llama3.2:3b\u0000  '), 'llama3.2:3b');
  assert.equal(normalizeLocalModel('x'.repeat(140)).length, 120);
});

test('rejects oversized terms and enforces the local vocabulary limit', () => {
  const values = ['x'.repeat(81), ...Array.from({ length: 60 }, (_, index) => `term-${index}`)];
  const result = normalizeProtectedTerms(values);
  assert.equal(result.length, MAX_PROTECTED_TERMS);
  assert.equal(result[0], 'term-0');
});

test('normalizes explicit style preferences to inspectable values', () => {
  assert.deepEqual(normalizeStylePreferences({ spelling: 'british', contractions: 'avoid' }), {
    spelling: 'british',
    contractions: 'avoid',
  });
  assert.deepEqual(normalizeStylePreferences({ spelling: 'formal', contractions: 'sometimes' }), {
    spelling: 'automatic',
    contractions: 'automatic',
  });
});
