# ToneBridge

[![CI](https://github.com/saifulalamfahim/tonebridge/actions/workflows/ci.yml/badge.svg)](https://github.com/saifulalamfahim/tonebridge/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Chrome MV3](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4.svg)](public/manifest.json)
[![Project status: alpha](https://img.shields.io/badge/status-alpha-orange.svg)](ROADMAP.md)

ToneBridge is an open-source writing assistant that converts Bangla and Banglish into natural English while preserving the writer's meaning, tone, formality, emotional intensity, and amount of information.

Its first client is a Chrome/Edge extension. When you pause after typing in a supported web editor, ToneBridge displays a floating English suggestion. You decide whether to replace the original text, copy the result, retry, or dismiss it.

> **Project status:** `v0.3.0-alpha` is an early, testable MVP. It is suitable for local experimentation, not yet for sensitive or production-critical communication.

## Why ToneBridge exists

Many Bengali speakers know exactly what they want to say, but expressing the same thought in English can become a barrier. Building a natural sentence takes time, the right word may not come to mind, and uncertainty about grammar can make a clear idea feel incomplete. A message that would be detailed, confident, and natural in Bangla may become shorter or less accurate simply because the writer knows less English.

The usual workaround also interrupts the conversation:

1. write the message in Bangla or Banglish somewhere else;
2. open a separate translation tool;
3. copy and paste the source text;
4. copy the English result back into the original conversation;
5. repair any meaning or tone that changed during translation.

This repeated context switching costs time and makes real-time communication harder. General translation tools may also make a direct message more polite, turn a casual message formal, weaken emotion, or introduce wording the writer would never have chosen.

ToneBridge is being built to remove that friction. The writer should be able to express the complete thought in Bangla or Banglish inside the current conversation, receive faithful English beside the same editor, and choose the result with one action. The goal is not to hide or replace English learning; it is to help people communicate clearly and independently while they are still building confidence in English.

This can be especially valuable for Bangladeshi freelancers working with international clients. Clearer questions, updates, explanations, and replies can reduce misunderstandings and response delays without requiring another person to compose the English message or forcing the freelancer to move repeatedly between applications.

General translators often make writing more formal, add explanations, remove nuance, or rewrite the idea. ToneBridge follows a narrower contract:

- preserve every fact and intention;
- preserve casual, polite, direct, or emotional tone;
- produce natural English without redesigning the message;
- never add advice, context, or an explanation;
- keep the user in control of every replacement.

See the complete [translation contract](docs/TRANSLATION_CONTRACT.md).

## Current capabilities

- Bangla and Banglish input with English-only output
- Floating overlay near standard inputs, textareas, and basic `contenteditable` elements
- Draggable overlay that stays inside the visible browser viewport
- One-click replace, copy, retry, dismiss, and short-lived undo
- Debounced requests and stale-response protection while the user continues typing
- Session-only result caching to reduce duplicate requests
- Optional Groq-powered live translation using the user's own free-tier key
- A small offline demo that works without an account or network request
- Isolated overlay styles through a closed Shadow DOM
- No translation-history database or analytics
- Provider boundary designed for future hosted or local open-source engines

## How it works

```text
Web editor
   |
   v
Content script: detect editor, debounce text, render isolated overlay
   |
   v
Extension background worker: read local settings, call provider
   |
   v
Translation provider: Groq today; replaceable provider interface for the future
```

The API key is read only by the extension background worker. It is never injected into the webpage or sent to the content script. Read [Architecture](docs/ARCHITECTURE.md) for component boundaries and data flow.

## Install locally

### Requirements

- Node.js `20.19` or newer
- npm
- Chrome or Edge

### Build the extension

```bash
git clone https://github.com/saifulalamfahim/tonebridge.git
cd tonebridge
npm install
npm run build
```

Then:

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose the generated `dist` directory.
5. Refresh any webpage that was already open.

After a source change, rebuild and press **Reload** on the extension card before refreshing the test page.

## Enable free live translation

ToneBridge does not bundle or sell an API key.

1. Create a free Groq API key at [console.groq.com/keys](https://console.groq.com/keys).
2. Open the ToneBridge extension popup.
3. Paste the key under **Groq API** and select **Save key**.
4. Type Bangla or Banglish in a supported field and pause briefly.

The key is stored in `chrome.storage.local`, not in source code or Chrome sync storage. Live text is sent to Groq through the extension background worker using `openai/gpt-oss-120b`. Groq controls free-tier limits, model availability, and its data handling terms; these may change independently of ToneBridge. ToneBridge never enables billing or makes paid requests automatically.

Review [Privacy and data flow](docs/PRIVACY.md) before using live translation.

## Offline demo

Without a configured key, the following exact examples demonstrate the interface without making a network request:

- `ami ajke jabo na`
- `ajke ami jabo na`
- `ami bujhte partasina eita keno hocche`

General translation requires a configured provider. The demo is intentionally small and is not presented as a translation engine.

## Supported editors and limitations

The alpha supports standard text inputs, textareas, and basic `contenteditable` elements on regular webpages. It does not yet guarantee support for:

- password fields or browser-internal pages;
- cross-origin iframes;
- editors inside website Shadow DOMs;
- complex rich-text editors used by some social and productivity applications;
- partial-selection translation or cursor-aware paragraph replacement;
- Firefox, Android, iOS, Windows-wide, or macOS-wide input.

Password fields are deliberately excluded. Please report editor compatibility issues with a public test page or a minimal reproduction—never with a private message or credential.

## Development commands

| Command                | Purpose                                                        |
| ---------------------- | -------------------------------------------------------------- |
| `npm run dev`          | Rebuild when source files change                               |
| `npm run build`        | Produce the unpacked extension in `dist/`                      |
| `npm run lint`         | Run ESLint                                                     |
| `npm test`             | Run provider tests without a real API key                      |
| `npm run format`       | Format supported files with Prettier                           |
| `npm run format:check` | Verify formatting without changing files                       |
| `npm run verify:build` | Validate the generated extension bundle                        |
| `npm run check`        | Run linting, formatting, tests, build, and bundle verification |

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — runtime components, trust boundaries, and data flow
- [Translation contract](docs/TRANSLATION_CONTRACT.md) — the behavioral definition of a faithful conversion
- [Privacy and data flow](docs/PRIVACY.md) — what is processed, stored, and sent
- [Provider guide](docs/PROVIDER_GUIDE.md) — how translation engines integrate safely
- [Testing guide](docs/TESTING.md) — automated and real-browser validation
- [Roadmap](ROADMAP.md) — milestone direction without delivery-date promises
- [Changelog](CHANGELOG.md) — notable project changes by version
- [Contributing](CONTRIBUTING.md) — contribution workflow and quality expectations
- [Security policy](SECURITY.md) — responsible vulnerability reporting
- [Code of Conduct](CODE_OF_CONDUCT.md) — community participation standards

## Contributing

Contributions are welcome, especially reproducible editor-compatibility fixes, privacy improvements, provider adapters, documentation, and invented Bangla/Banglish evaluation cases. Start with [CONTRIBUTING.md](CONTRIBUTING.md), run `npm run check`, and explain how the change preserves the translation contract.

Do not submit real private conversations, API keys, personal data, or copyrighted datasets without compatible licensing and documented provenance.

## Project governance and scope

ToneBridge currently uses a maintainer-led model while the architecture and behavioral contract stabilize. Important product changes should begin as a GitHub issue so intent, privacy impact, and scope can be discussed before implementation. The roadmap is directional and does not promise dates.

## License

Copyright 2026 ToneBridge contributors.

Licensed under the [Apache License 2.0](LICENSE). Contributions are accepted under the same license.
