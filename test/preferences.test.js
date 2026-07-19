import assert from 'node:assert/strict';
import test from 'node:test';
import { MAX_PROTECTED_TERMS, normalizeProtectedTerms } from '../src/shared/preferences.js';

test('normalizes protected terms without changing accepted spelling', () => {
  assert.deepEqual(
    normalizeProtectedTerms(' ToneBridge \nReact 19\ntonebridge\n\nSaiful Alam Fahim'),
    ['ToneBridge', 'React 19', 'Saiful Alam Fahim'],
  );
});

test('rejects oversized terms and enforces the local vocabulary limit', () => {
  const values = ['x'.repeat(81), ...Array.from({ length: 60 }, (_, index) => `term-${index}`)];
  const result = normalizeProtectedTerms(values);
  assert.equal(result.length, MAX_PROTECTED_TERMS);
  assert.equal(result[0], 'term-0');
});
