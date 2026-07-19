# Privacy and Data Flow

ToneBridge processes text that may be personal. This document explains the alpha's behavior so users and contributors can make informed decisions.

## Summary

- ToneBridge does not operate analytics or a translation-history database.
- Password fields are excluded.
- Offline demo matches make no network request.
- Automatic mode sends eligible text after a typing pause; Manual mode sends it only after the user invokes the translation shortcut.
- A Groq API key is stored in Chrome local extension storage and used only by the background worker.
- Protected vocabulary is stored locally in the same trusted extension context and is sent to the configured provider only as translation guidance.
- Local secret storage is restricted to trusted extension contexts, so content scripts cannot read the provider key.
- The normal enabled/disabled, translation-mode, and site-origin preferences may be stored with Chrome sync because they are not secrets.

## Live translation flow

1. The extension observes the focused supported editor only when globally enabled and not disabled for the current site origin.
2. In Automatic mode, the content script sends the current text after typing pauses for the configured debounce. In Manual mode, typing alone sends nothing; the current text is sent only after the user invokes the focused-editor shortcut.
3. The background worker reads the locally stored provider key.
4. It sends the source text and translation instructions to Groq.
5. The returned English text is displayed in the overlay.
6. The original text changes only if the user explicitly selects **Replace**.

Groq is an independent external service. Its free-tier limits, retention practices, model availability, and terms are controlled by Groq and may change. Review its current policies before translating sensitive content.

## Data inventory

| Data               | Where it is used                                         | Persistence                                                             |
| ------------------ | -------------------------------------------------------- | ----------------------------------------------------------------------- |
| Source text        | Content script, background worker, configured provider   | Not intentionally written to extension storage; provider policy applies |
| Translation result | Overlay and short session cache                          | Current extension session only                                          |
| Groq API key       | Trusted popup and background worker                      | Protected `chrome.storage.local` until removed                          |
| Protected terms    | Trusted popup, background worker, configured provider    | Protected `chrome.storage.local` until cleared                          |
| Enabled preference | Popup/content behavior                                   | Chrome storage; may sync through the user's browser account             |
| Translation mode   | Determines whether typing or a shortcut starts a request | Chrome storage; may sync through the user's browser account             |
| Site rules         | Per-origin global, automatic, manual, or disabled choice | Chrome storage; may sync through the user's browser account             |
| Undo text          | Immediate replacement interaction                        | Short-lived memory only                                                 |

## What ToneBridge deliberately avoids

- processing password inputs;
- embedding a shared maintainer API key;
- exposing provider keys to content scripts;
- logging message contents or credentials;
- collecting analytics, advertising identifiers, or telemetry;
- saving a translation history;
- automatically accepting a translation;
- enabling paid provider usage.

## User guidance

The alpha should not be used for passwords, authentication codes, financial details, health records, legal secrets, or other high-risk content. Disable the extension when it is not needed and remove the provider key from the popup when testing is complete.

## Contributor privacy checklist

Any change that adds a provider, permission, remote endpoint, telemetry, history, style learning, or synchronization must document:

- the exact data collected or transmitted;
- why it is necessary;
- where it goes and how long it remains;
- how the user consents, disables it, and deletes it;
- how secrets are isolated from webpages;
- what safer alternatives were considered.

Such changes should begin with a public design issue that contains invented data only. Security vulnerabilities must follow [SECURITY.md](../SECURITY.md).
