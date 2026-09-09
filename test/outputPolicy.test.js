import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTranslation, completionBudget } from '../src/core/translation/outputPolicy.js';

const response = (content, finish_reason = 'stop') => ({
  choices: [{ message: { content }, finish_reason }],
});
test('refuses truncated and filtered translations instead of offering partial replacement', () => {
  for (const reason of ['length', 'content_filter', 'tool_calls']) {
    assert.throws(() => validateTranslation(response('I will', reason), 'ami jabo'), {
      code: 'INCOMPLETE_TRANSLATION',
    });
  }
});
test('refuses malformed or empty provider content', () => {
  for (const content of [null, [], {}, '', '  '])
    assert.throws(() => validateTranslation(response(content), 'hello'), {
      code: 'INVALID_RESPONSE',
    });
});
test('refuses missing literal vocabulary and changed URLs', () => {
  assert.throws(
    () => validateTranslation(response('Use another app.'), 'ToneBridge use koro', ['ToneBridge']),
    { code: 'FIDELITY_CHECK_FAILED' },
  );
  assert.throws(
    () => validateTranslation(response('Open https://other.test'), 'https://example.test kholo'),
    { code: 'FIDELITY_CHECK_FAILED' },
  );
});
test('preserves valid paragraphs, punctuation and literal terms without rewriting output', () => {
  const text = 'Use ToneBridge.\n\nCan you check https://example.test?';
  assert.equal(
    validateTranslation(response(text), 'ToneBridge use koro.\nhttps://example.test check korba?', [
      'ToneBridge',
    ]).translation,
    text,
  );
});
test('does not require vocabulary absent from the source', () => {
  assert.equal(
    validateTranslation(response('I will go.'), 'ami jabo', ['Fiverr']).translation,
    'I will go.',
  );
});
test('long input receives a larger bounded completion budget', () => {
  assert.ok(completionBudget('a'.repeat(8000)) > completionBudget('ami jabo'));
  assert.ok(completionBudget('a'.repeat(8000)) <= 8192);
});

test('rejects common provider commentary without stripping it into a misleading result', () => {
  for (const output of [
    "Here's the translation: I will go.",
    'Translation: I will go.',
    '<think>reasoning</think>I will go.',
  ]) {
    assert.throws(() => validateTranslation(response(output), 'ami jabo'), {
      code: 'UNWANTED_COMMENTARY',
    });
  }
});

test('allows a translation label when it was itself the source content', () => {
  assert.equal(
    validateTranslation(response('Translation: I will go.'), 'Translation: ami jabo').translation,
    'Translation: I will go.',
  );
});
