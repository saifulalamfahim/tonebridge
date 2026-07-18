import assert from 'node:assert/strict';
import test from 'node:test';
import {
  GroqApiError,
  GroqTranslationProvider,
} from '../src/core/translation/GroqTranslationProvider.js';

test('returns a translation and sends the fidelity prompt', async () => {
  let request;
  const fetchImpl = async function (url, options) {
    assert.equal(this, undefined, 'native fetch must not receive the provider as its receiver');
    request = { url, options };
    return new Response(
      JSON.stringify({ choices: [{ message: { content: "I won't go today." } }] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  };
  const provider = new GroqTranslationProvider({ apiKey: 'test-key', fetchImpl });
  const result = await provider.translate('ajke ami jabo na');
  const body = JSON.parse(request.options.body);

  assert.equal(result.translation, "I won't go today.");
  assert.equal(request.url, 'https://api.groq.com/openai/v1/chat/completions');
  assert.equal(request.options.headers.Authorization, 'Bearer test-key');
  assert.equal(body.messages[1].content, 'ajke ami jabo na');
  assert.match(body.messages[0].content, /Do not add or remove information/);
  assert.equal(body.model, 'openai/gpt-oss-120b');
  assert.equal(body.reasoning_format, 'hidden');
});

test('preserves safe Groq error details for diagnosis', async () => {
  const provider = new GroqTranslationProvider({
    apiKey: 'test-key',
    fetchImpl: async () =>
      new Response(JSON.stringify({ error: { message: 'The selected model is unavailable.' } }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
  });
  await assert.rejects(provider.translate('hello'), (error) => {
    assert.equal(error.code, 'REQUEST_FAILED');
    assert.match(error.message, /HTTP 400/);
    assert.match(error.message, /selected model is unavailable/);
    return true;
  });
});

test('rejects a missing API key before making a request', async () => {
  const provider = new GroqTranslationProvider({ apiKey: '', fetchImpl: assert.fail });
  await assert.rejects(provider.translate('hello'), (error) => {
    assert.ok(error instanceof GroqApiError);
    assert.equal(error.code, 'MISSING_API_KEY');
    return true;
  });
});

test('returns a clear free-tier rate-limit error', async () => {
  const provider = new GroqTranslationProvider({
    apiKey: 'test-key',
    fetchImpl: async () => new Response('{}', { status: 429 }),
  });
  await assert.rejects(provider.translate('hello'), (error) => {
    assert.equal(error.code, 'RATE_LIMIT');
    return true;
  });
});
