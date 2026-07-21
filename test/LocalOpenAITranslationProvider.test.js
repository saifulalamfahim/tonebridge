import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LOCAL_OPENAI_ENDPOINT,
  LocalOpenAITranslationProvider,
} from '../src/core/translation/LocalOpenAITranslationProvider.js';

test('translates through the fixed Ollama loopback endpoint', async () => {
  let request;
  const provider = new LocalOpenAITranslationProvider({
    model: 'llama3.2:3b',
    fetchImpl: async (url, options) => {
      request = { url, options };
      return {
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'I will not go today.' } }] }),
      };
    },
  });

  assert.deepEqual(await provider.translate('ami ajke jabo na'), {
    translation: 'I will not go today.',
    message: '',
  });
  assert.equal(request.url, LOCAL_OPENAI_ENDPOINT);
  assert.equal(request.options.headers.Authorization, 'Bearer ollama');
  const body = JSON.parse(request.options.body);
  assert.equal(body.model, 'llama3.2:3b');
  assert.match(body.messages[0].content, /Do not add or remove information/);
  assert.equal(body.messages[1].content, 'ami ajke jabo na');
});

test('requires an installed local model name', async () => {
  const provider = new LocalOpenAITranslationProvider({ model: '' });
  await assert.rejects(() => provider.translate('test'), /installed Ollama model/i);
});

test('reports when the local Ollama service cannot be reached', async () => {
  const provider = new LocalOpenAITranslationProvider({
    model: 'llama3.2:3b',
    fetchImpl: async () => {
      throw new TypeError('fetch failed');
    },
  });
  await assert.rejects(() => provider.translate('test'), /Could not reach Ollama/i);
});
