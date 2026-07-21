import assert from 'node:assert/strict';
import test from 'node:test';
import { assertValidSourceText, MAX_SOURCE_TEXT_LENGTH } from '../src/shared/inputPolicy.js';

test('accepts non-empty source text within the supported limit', () => {
  assert.equal(assertValidSourceText('ami ajke jabo na'), 'ami ajke jabo na');
});

test('rejects empty and oversized source text before a provider request', () => {
  assert.throws(() => assertValidSourceText('   '), { code: 'EMPTY_SOURCE_TEXT' });
  assert.throws(() => assertValidSourceText('x'.repeat(MAX_SOURCE_TEXT_LENGTH + 1)), {
    code: 'SOURCE_TEXT_TOO_LONG',
  });
});
