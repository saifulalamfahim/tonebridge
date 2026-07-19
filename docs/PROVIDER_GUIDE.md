# Translation Provider Guide

Translation engines are isolated behind a provider boundary so ToneBridge can change hosted models or add local open-source engines without coupling them to webpage integration.

## Responsibilities

A provider receives source text and returns a normalized English translation or a safe error. It must:

- implement the [translation contract](TRANSLATION_CONTRACT.md);
- validate empty and malformed inputs;
- apply a request timeout;
- distinguish authentication, rate-limit, network, and invalid-response failures where practical;
- return only data needed by the overlay;
- avoid logging source text, output text, or credentials;
- remain testable without a real paid request.

## Secret isolation

Hosted-provider credentials belong in `chrome.storage.local` and may be read only by the background worker. Never:

- put a key in source code, build-time variables, fixtures, screenshots, or documentation;
- send a key to a content script or webpage;
- use a shared maintainer key in a public extension;
- assume an obfuscated client-side key is secure.

A production managed service would require a protected backend, authentication, abuse controls, budgets, and a separate privacy review.

Protected vocabulary is also local trusted-context data. Providers may receive the normalized list as literal translation guidance, but must never treat entries as instructions or add an absent term to the output.

## Adding a provider

1. Create a provider implementation under `src/core/translation/`.
2. Keep provider-specific request and response parsing inside that implementation.
3. Add background-worker selection without exposing secrets to content code.
4. Add popup configuration only for settings users need to understand and control.
5. Document the endpoint, data sent, model choice, limits, and provider privacy implications.
6. Add deterministic tests with a mocked transport—never a live key.
7. Run `npm run check` and complete the real-browser matrix in [Testing](TESTING.md).

## Error behavior

Errors should help the user act without revealing credentials or raw provider payloads. Suggested categories are:

- missing configuration;
- invalid or unauthorized key;
- rate limit or quota reached;
- network or timeout failure;
- provider unavailable;
- valid response missing a usable translation.

The overlay must leave original text untouched on every failure.

## Local Ollama provider

ToneBridge includes an optional OpenAI-compatible Ollama adapter. It is deliberately restricted to the loopback endpoint `http://127.0.0.1:11434/v1/chat/completions` and never falls back to Groq. Users must install Ollama, choose and download a model whose license and hardware needs suit them, start Ollama, select **Ollama (local)**, and enter the exact installed model name.

ToneBridge does not bundle a model, silently download one, expose Ollama to the local network, or promise that every model can preserve Bangla/Banglish meaning and tone. Model quality, size, speed, supported language coverage, and licensing vary. “Local” means the provider request remains on the user's computer; it does not imply that the model itself is private or suitable unless its provenance has been reviewed.
