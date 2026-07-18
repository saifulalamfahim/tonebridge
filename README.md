# ToneBridge

[![CI](https://github.com/saifulalamfahim/tonebridge/actions/workflows/ci.yml/badge.svg)](https://github.com/saifulalamfahim/tonebridge/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

ToneBridge is an open-source, tone-preserving Bangla and Banglish to English writing assistant. The first client is a Chrome/Edge extension that displays an English suggestion near a text field and can replace the original with one click.

> Status: early MVP. The overlay, popup, settings, provider boundary, offline demo, and optional Groq-powered live translation are implemented.

Current interaction features include session-only translation caching, stale-response protection while typing, explicit replace/copy/retry actions, and a safe short-lived undo after replacement.

## Principles

- Preserve meaning, intent, tone, formality, and information.
- Never add or remove information.
- Keep private text out of ToneBridge history and storage.
- Keep the core client and provider interface open source.
- Do not require paid services for local development.

## Local development

Requirements: Node.js 20.19+ and Chrome or Edge.

```bash
npm install
npm run build
```

Open `chrome://extensions` (or `edge://extensions`), enable **Developer mode**, choose **Load unpacked**, and select the generated `dist` folder. Reload the extension and refresh test pages after every build.

## Connect free live translation

1. Create a free Groq API key at [console.groq.com/keys](https://console.groq.com/keys).
2. Open the ToneBridge extension popup.
3. Paste the key under **Groq API** and choose **Save key**.
4. Type Bangla or Banglish into a supported editor and pause briefly.

The key is stored in `chrome.storage.local`, not source code or sync storage. Translation requests are made by the background service to Groq using `openai/gpt-oss-120b`. The webpage and content script never receive the API key.

Free-tier limits and model availability are controlled by Groq and may change. ToneBridge never upgrades billing or makes paid requests automatically. A public release must use per-user keys or a protected backend; never publish a shared key in the extension.

## Offline demo

Without a Groq key, these exact examples still work without a network request:

- `ami ajke jabo na`
- `ajke ami jabo na`
- `ami bujhte partasina eita keno hocche`

Other text asks the user to configure a key.

## Commands

| Command          | Purpose                                   |
| ---------------- | ----------------------------------------- |
| `npm run dev`    | Rebuild when source files change          |
| `npm run build`  | Create the unpacked extension in `dist/`  |
| `npm run lint`   | Run ESLint                                |
| `npm test`       | Run provider tests without a real API key |
| `npm run format` | Format files with Prettier                |
| `npm run check`  | Run all tests and production verification |

## Architecture

```text
src/
|-- background/        API calls, message handling, and lifecycle defaults
|-- content/           Editor detection, overlay, and text replacement
|-- core/translation/  Groq, extension-message, and offline demo providers
|-- popup/             Extension controls and API-key settings
`-- shared/            Shared settings, messages, and constants
```

The overlay uses a closed Shadow DOM so website styles do not leak into it. Translation logic sits behind `TranslationProvider`, allowing hosted or local engines to be changed without coupling them to page integration.

## Current scope

Standard text inputs, textareas, and basic `contenteditable` elements on regular web pages are supported initially. Password fields, browser-internal pages, iframes, Shadow DOM editors, and complex rich-text editors are outside this MVP.

## Privacy

Offline demo mode makes no network requests. With a Groq key configured, typed text is sent to Groq after the typing debounce. The enabled setting uses Chrome sync storage; the API key uses local extension storage. ToneBridge does not store message history. Review Groq's current data policy before processing sensitive text.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Licensed under [Apache License 2.0](LICENSE).
