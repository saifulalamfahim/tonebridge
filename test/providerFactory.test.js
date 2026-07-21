import assert from 'node:assert/strict';
import test from 'node:test';
import { GroqTranslationProvider } from '../src/core/translation/GroqTranslationProvider.js';
import { LocalOpenAITranslationProvider } from '../src/core/translation/LocalOpenAITranslationProvider.js';
import { createTranslationProvider } from '../src/core/translation/providerFactory.js';
import { TRANSLATION_PROVIDER_API_VERSION } from '../src/core/translation/TranslationProvider.js';

test('publishes the stable provider contract version', () => {
  assert.equal(TRANSLATION_PROVIDER_API_VERSION, 1);
});

test('creates the explicitly selected local provider', () => {
  const provider = createTranslationProvider({ providerId: 'local', localModel: 'llama3.2:3b' });
  assert.ok(provider instanceof LocalOpenAITranslationProvider);
});

test('defaults unknown provider values to Groq', () => {
  const provider = createTranslationProvider({ providerId: 'unknown', groqApiKey: 'test-key' });
  assert.ok(provider instanceof GroqTranslationProvider);
});
