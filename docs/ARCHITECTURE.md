# Architecture

This document describes the `v0.3.0-alpha` browser-extension architecture and the boundaries contributors should preserve.

## Design goals

- Keep translation behavior independent from webpage integration.
- Keep credentials out of webpages and content scripts.
- Make every text replacement an explicit user action.
- Avoid storing message history.
- Allow hosted and local engines to implement the same provider contract.
- Fail visibly without changing the user's original text.

## Runtime data flow

```text
Supported web editor
  -> automatic mode reads current text after a debounce, or manual mode waits for the shortcut
  -> content script requests a translation through extension messaging
  -> background service worker reads provider settings and local API key
  -> provider sends the source text to its configured endpoint
  -> background worker returns a normalized result
  -> content script ignores stale results and renders the latest suggestion
  -> user explicitly replaces or copies the suggestion
```

The source editor remains unchanged until the user selects **Replace**. If the text changes while a request is in flight, the stale result is ignored.

## Components

### Manifest and build

`public/manifest.json` defines the Manifest V3 extension, its service worker, content script, popup, permissions, and host access. Vite builds the popup/background bundle and a second IIFE bundle for the content script. `scripts/verify-build.js` checks that required files exist and that the content script is compatible with extension injection.

### Content layer

`src/content/` owns editor discovery, per-site rule enforcement, automatic debouncing, manual command handling, overlay state, user actions, and safe replacement. It supports standard inputs, textareas, and basic contenteditable elements. The overlay mounts in a closed Shadow DOM so site CSS does not affect it and overlay CSS does not affect the site.

This layer must not read or receive provider credentials.

### Background service worker

`src/background/service-worker.js` is the privileged network boundary. It receives translation requests, reads the locally stored provider key, chooses the provider, and returns normalized success or error data. Provider-specific network behavior belongs behind this boundary.

### Translation providers

`src/core/translation/TranslationProvider.js` defines the abstraction. Current implementations include:

- `GroqTranslationProvider` for live translation;
- `ExtensionTranslationProvider` for content-to-background messaging;
- `DemoTranslationProvider` for a small deterministic offline demonstration.

See [Provider guide](PROVIDER_GUIDE.md) before adding an engine.

### Popup

`src/popup/` owns user-facing extension controls, global and per-site trigger selection, shortcut discovery, and API-key setup. The key is written to `chrome.storage.local`, whose access level is restricted to trusted extension contexts by the background worker. Ordinary enabled, translation-mode, and site-origin settings may use sync storage because they are not secrets.

## Trust boundaries

| Boundary          | Trusted responsibilities                         | Must not do                                       |
| ----------------- | ------------------------------------------------ | ------------------------------------------------- |
| Webpage           | Host the editor                                  | Receive extension credentials                     |
| Content script    | Read eligible editor text and render UI          | Read API keys or call provider endpoints directly |
| Background worker | Read provider settings and make network requests | Store translation history                         |
| Provider          | Convert text under its own policy                | Be assumed private without reviewing its terms    |

## State and failure behavior

- Debouncing prevents a request per keystroke.
- Per-site rules are resolved before editor text can trigger a request; disabled sites reject both automatic and shortcut translation.
- Session caching avoids repeated requests for identical text during the current extension context.
- Request identity prevents an older response from replacing a newer suggestion.
- Network, authentication, rate-limit, and malformed-response failures are converted into user-readable states.
- A failure never modifies the source editor.
- Undo retains only the short-lived replacement information needed for that interaction.

## Extension constraints

Manifest V3 service workers can stop and restart. Code must not rely on process memory for durable state. Rich-text editors, iframes, and Shadow DOM editors have different event and selection models; compatibility work should use adapters rather than site-specific logic inside the overlay.

## Future direction

The provider interface is intended to support self-hosted and local open-source translation engines. Personal style profiles, when introduced, require a separate consent, retention, and deletion design and must not be silently derived from private messages.
