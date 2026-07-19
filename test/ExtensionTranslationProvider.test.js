import assert from 'node:assert/strict';
import test from 'node:test';
import { ExtensionTranslationProvider } from '../src/core/translation/ExtensionTranslationProvider.js';

test('asks for a page refresh when an extension reload invalidates the content script', async () => {
  const originalChrome = globalThis.chrome;
  globalThis.chrome = {
    runtime: {
      sendMessage: async () => {
        throw new Error('Extension context invalidated.');
      },
    },
  };

  try {
    const result = await new ExtensionTranslationProvider().translate('ami ajke jabo na');
    assert.equal(result.translation, '');
    assert.match(result.message, /refresh this page once/i);
  } finally {
    globalThis.chrome = originalChrome;
  }
});
