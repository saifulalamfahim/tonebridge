import { TranslationProvider } from './TranslationProvider.js';
import { buildTranslationPrompt } from './prompt.js';
import { assertValidSourceText } from '../../shared/inputPolicy.js';

export const GROQ_MODEL = 'openai/gpt-oss-120b';

export class GroqApiError extends Error {
  constructor(message, code, status = 0) {
    super(message);
    this.name = 'GroqApiError';
    this.code = code;
    this.status = status;
  }
}

export class GroqTranslationProvider extends TranslationProvider {
  constructor({
    apiKey,
    fetchImpl = globalThis.fetch,
    model = GROQ_MODEL,
    protectedTerms = [],
    stylePreferences = {},
  }) {
    super();
    this.apiKey = apiKey;
    this.fetchImpl = fetchImpl;
    this.model = model;
    this.prompt = buildTranslationPrompt({ protectedTerms, stylePreferences });
  }

  async translate(text) {
    assertValidSourceText(text);
    if (!this.apiKey) throw new GroqApiError('A Groq API key is required.', 'MISSING_API_KEY');

    let response;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20_000);
    try {
      const fetchRequest = this.fetchImpl;
      response = await fetchRequest('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: this.prompt,
            },
            { role: 'user', content: text },
          ],
          temperature: 0.1,
          max_completion_tokens: 512,
          reasoning_effort: 'low',
          reasoning_format: 'hidden',
        }),
        signal: controller.signal,
      });
    } catch (error) {
      const message =
        error.name === 'AbortError'
          ? 'Groq took too long to respond.'
          : 'The browser could not connect to Groq. Check your connection and reload ToneBridge.';
      throw new GroqApiError(message, 'NETWORK_ERROR');
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403)
        throw new GroqApiError(
          'The saved Groq API key is invalid.',
          'INVALID_API_KEY',
          response.status,
        );
      if (response.status === 429)
        throw new GroqApiError(
          'The Groq free limit is temporarily exhausted. Try again later.',
          'RATE_LIMIT',
          429,
        );
      let providerMessage = '';
      try {
        const errorData = await response.json();
        providerMessage = errorData.error?.message?.trim() ?? '';
      } catch {
        // Groq occasionally returns an empty or non-JSON error response.
      }
      const safeDetail = providerMessage ? ` ${providerMessage.slice(0, 240)}` : '';
      throw new GroqApiError(
        `Groq request failed (HTTP ${response.status}).${safeDetail}`,
        'REQUEST_FAILED',
        response.status,
      );
    }

    const data = await response.json();
    const translation = data.choices?.[0]?.message?.content?.trim();
    if (!translation)
      throw new GroqApiError('Groq returned an empty translation.', 'INVALID_RESPONSE');
    return { translation, message: '' };
  }
}
