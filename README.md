# ToneBridge

[![CI](https://github.com/saifulalamfahim/tonebridge/actions/workflows/ci.yml/badge.svg)](https://github.com/saifulalamfahim/tonebridge/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Chrome MV3](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4.svg)](public/manifest.json)
[![Release](https://img.shields.io/badge/release-v1.0.1-2ea44f.svg)](https://github.com/saifulalamfahim/tonebridge/releases/tag/v1.0.1)

ToneBridge is an open-source writing assistant that converts Bangla and Banglish into natural English without changing the writer's meaning, tone, formality, emotional intensity, or amount of information.

Its first client is a Chrome/Edge extension. Write inside a supported web editor, receive a floating English suggestion beside it, and explicitly replace or copy the result. No separate translation tab or repeated copy/paste loop is needed.

> **Status:** `v1.0.1` is the latest stable Chrome and Edge release. See the completed [browser acceptance matrix](docs/V1_ACCEPTANCE.md) and [release process](docs/RELEASE_PROCESS.md).

## Why it exists

Many Bengali speakers know exactly what they want to communicate but need extra time to form the English sentence, recall words, or check grammar. Their detailed, confident Bangla thought can become shorter or less accurate because English is the barrier—not the idea.

The common workaround interrupts the conversation: write elsewhere, open a translator, paste the source, copy the result back, then repair any tone or meaning that changed. This is particularly costly for Bangladeshi freelancers communicating with international clients.

ToneBridge keeps that flow inside the original editor and follows a narrow [translation contract](docs/TRANSLATION_CONTRACT.md):

- preserve every fact, question, intention, and emotional strength;
- preserve casual, polite, formal, or direct tone;
- produce natural English without redesigning the message;
- never add advice, context, an answer, or an explanation;
- leave the original text unchanged until the user chooses **Replace**.

## v1 capabilities

- Bangla, Banglish, and mixed input with English-only output
- Standard inputs, textareas, generic contenteditable editors, and compatibility work for ChatGPT, Gmail, and LinkedIn
- Floating Shadow DOM overlay above site UI, draggable by pointer or keyboard and bounded to the viewport
- Automatic translation after a 650 ms pause or Manual translation through a configurable shortcut
- Per-site global, automatic, manual-only, and disabled behavior
- Replace, Copy, Retry, Dismiss, short-lived Undo, stale-result rejection, and a bounded session cache
- Protected names, brands, versions, and technical terms
- Explicit American/British spelling and contraction preferences without silent message-based profiling
- Hosted Groq or optional loopback-only local Ollama; no paid service or billing is enabled by ToneBridge
- Export of non-secret settings and complete deletion of locally stored ToneBridge data
- Password-field exclusion, 8,000-character request limit, trusted credential isolation, narrow host permissions, and no analytics/history database
- Versioned provider API and storage migrations for safe upgrades
- Invented 30-case evaluation dataset, 44 deterministic tests, secret scanning, CI, and production-bundle verification

See the exact [compatibility baseline](docs/COMPATIBILITY.md) and [privacy data flow](docs/PRIVACY.md).

## Architecture

```text
Supported web editor
  -> content script resolves the editor and trigger policy
  -> background worker reads protected provider settings
  -> explicitly selected Groq or local Ollama provider
  -> isolated overlay displays the normalized result
  -> user chooses whether to replace the source text
```

Provider credentials never enter the webpage or content script. Ollama mode sends requests only to `127.0.0.1:11434` and never silently falls back to Groq. Read [Architecture](docs/ARCHITECTURE.md) and the [Provider guide](docs/PROVIDER_GUIDE.md) before changing these boundaries.

## Install locally

Requirements: Node.js `20.19` or newer, npm, and Chrome or Edge.

```bash
git clone https://github.com/saifulalamfahim/tonebridge.git
cd tonebridge
npm ci
npm run build
```

Then open `chrome://extensions` or `edge://extensions`, enable **Developer mode**, choose **Load unpacked**, and select the generated `dist` folder. Refresh pages that were already open. After rebuilding, reload the extension and refresh the test page once.

## Choose a provider

### Groq hosted mode

1. Create a personal free-tier key at [Groq Console](https://console.groq.com/keys).
2. Open ToneBridge and select **Groq (hosted)**.
3. Save the key under **Groq API**.

The key stays in protected local extension storage. Source text is sent to Groq only according to the selected Automatic/Manual/site trigger. Groq controls its own limits, retention, model availability, and terms; ToneBridge never enables billing or embeds a maintainer key.

### Local Ollama mode

1. Install Ollama separately and download a model suitable for Bangla/Banglish translation.
2. Start Ollama, select **Ollama (local)**, and enter the exact installed model name.
3. Test with invented text before relying on that model's quality.

ToneBridge does not bundle or download a model. Model size, licensing, speed, and language quality vary. The fixed loopback connection is documented in the [Provider guide](docs/PROVIDER_GUIDE.md).

Without a Groq key, three exact offline examples remain available only to demonstrate the interface; they are not a general translation engine.

## Controls and privacy

- **Automatic:** translate after typing pauses.
- **Manual:** send nothing while typing; invoke the focused-editor shortcut shown in the popup.
- **This site:** follow global behavior, force Automatic, force Manual, or disable ToneBridge for the entire origin.
- **Protected vocabulary:** keep normalized terms literal when they appear in the source.
- **Your data:** export inspectable non-secret JSON or delete provider configuration, credentials, vocabulary, style, and site rules.

Never test with passwords, authentication codes, financial/health/legal secrets, private client messages, or production credentials. Read [Privacy](docs/PRIVACY.md) and [Security](SECURITY.md).

## Development

| Command                 | Purpose                                                     |
| ----------------------- | ----------------------------------------------------------- |
| `npm run dev`           | Rebuild source changes in development mode                  |
| `npm run build`         | Produce the unpacked extension in `dist/`                   |
| `npm run lint`          | Run ESLint                                                  |
| `npm test`              | Run deterministic tests without a live key                  |
| `npm run eval:dataset`  | Validate the public invented evaluation dataset             |
| `npm run security:scan` | Detect common committed-secret signatures                   |
| `npm run verify:build`  | Verify bundle targets, permissions, isolation, and versions |
| `npm run check`         | Run the complete local quality gate                         |
| `npm run release:check` | Run the required automated release gate                     |

## Built with Codex and GPT-5.6

ToneBridge was developed for OpenAI Build Week with Codex and GPT-5.6 as the maintainer's primary development partner. The product idea, acceptance decisions, and final release approval remain the maintainer's responsibility.

Codex accelerated the project by helping to:

- design the Manifest V3 architecture and isolate provider credentials in the background extension context;
- implement the React interface, floating Shadow DOM overlay, provider system, privacy controls, and accessibility behavior;
- diagnose compatibility failures in standard inputs and rich-text editors such as ChatGPT, Gmail, LinkedIn, and Fiverr;
- create the translation contract, invented evaluation dataset, deterministic tests, secret scanning, build verification, and GitHub Actions workflow;
- prepare contributor documentation, security guidance, release checks, and the v1 acceptance process.

GPT-5.6 was used through Codex for architecture reasoning, implementation, debugging, test design, documentation, and release preparation. The runtime translation provider remains separately configurable: users can choose Groq-hosted OpenAI `gpt-oss` or a loopback-only local Ollama model. No paid API or embedded maintainer credential is required.

## Documentation

- [Compatibility](docs/COMPATIBILITY.md)
- [v1 final acceptance](docs/V1_ACCEPTANCE.md)
- [Release process](docs/RELEASE_PROCESS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Translation contract](docs/TRANSLATION_CONTRACT.md)
- [Privacy and data flow](docs/PRIVACY.md)
- [Provider guide](docs/PROVIDER_GUIDE.md)
- [Testing guide](docs/TESTING.md)
- [Evaluation dataset](datasets/README.md)
- [Android direction](docs/ANDROID_DIRECTION.md)
- [Roadmap](ROADMAP.md)
- [Changelog](CHANGELOG.md)
- [Contributing](CONTRIBUTING.md), [Support](SUPPORT.md), and [Security](SECURITY.md)

## Contributing

Contributions are welcome through issues and pull requests. Use invented data, keep credentials and private messages out of commits, run `npm run check`, and explain how the change preserves the translation contract. The maintainer reviews changes before they join `main`; an external fork or pull request cannot silently alter a user's installed extension.

ToneBridge currently uses a maintainer-led governance model while the browser contract stabilizes. See [CONTRIBUTING.md](CONTRIBUTING.md) for workflow and quality expectations.

## License

Copyright 2026 ToneBridge contributors.

Licensed under the [Apache License 2.0](LICENSE). Contributions are accepted under the same license.
