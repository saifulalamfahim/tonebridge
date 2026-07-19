import { normalizeLocalModel } from '../../shared/preferences.js';
import { TranslationProvider } from './TranslationProvider.js';
import { buildTranslationPrompt } from './prompt.js';

export const LOCAL_OPENAI_ENDPOINT = 'http://127.0.0.1:11434/v1/chat/completions';

export class LocalProviderError extends Error {
  constructor(message, code, status = 0) {
    super(message);
    this.name = 'LocalProviderError';
    this.code = code;
    this.status = status;
  }
}

export class LocalOpenAITranslationProvider extends TranslationProvider {
  constructor({ model, fetchImpl = globalThis.fetch, protectedTerms = [], stylePreferences = {} }) {
    super();
    this.model = normalizeLocalModel(model);
    this.fetchImpl = fetchImpl;
    this.prompt = buildTranslationPrompt({ protectedTerms, stylePreferences });
  }

  async translate(text) {
    if (!this.model)
      throw new LocalProviderError(
        'Enter the name of an installed Ollama model in ToneBridge settings.',
        'MISSING_LOCAL_MODEL',
      );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60_000);
    let response;
    try {
      response = await this.fetchImpl(LOCAL_OPENAI_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ollama',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: this.prompt },
            { role: 'user', content: text },
          ],
          temperature: 0.1,
          max_tokens: 512,
          stream: false,
        }),
        signal: controller.signal,
      });
    } catch (error) {
      const message =
        error.name === 'AbortError'
          ? 'The local model took too long to respond.'
          : 'Could not reach Ollama at 127.0.0.1:11434. Start Ollama and try again.';
      throw new LocalProviderError(message, 'LOCAL_NETWORK_ERROR');
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok)
      throw new LocalProviderError(
        `The local provider request failed (HTTP ${response.status}).`,
        'LOCAL_REQUEST_FAILED',
        response.status,
      );
    const data = await response.json();
    const translation = data.choices?.[0]?.message?.content?.trim();
    if (!translation)
      throw new LocalProviderError(
        'The local provider returned an empty translation.',
        'INVALID_LOCAL_RESPONSE',
      );
    return { translation, message: '' };
  }
}
