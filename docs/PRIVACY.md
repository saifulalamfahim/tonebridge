# Privacy and Data Flow

ToneBridge processes text that may be personal. This document explains the alpha's behavior so users and contributors can make informed decisions.

## Summary

- ToneBridge does not operate analytics or a translation-history database.
- Password fields are excluded.
- Offline demo matches make no network request.
- Live translation sends eligible typed text to the configured provider.
- A Groq API key is stored in Chrome local extension storage and used only by the background worker.
- The normal enabled/disabled preference may be stored with Chrome sync because it is not a secret.

## Live translation flow

1. The extension observes text in a supported editor while enabled.
2. After typing pauses for the configured debounce, the content script sends the current text to the extension background worker.
3. The background worker reads the locally stored provider key.
4. It sends the source text and translation instructions to Groq.
5. The returned English text is displayed in the overlay.
6. The original text changes only if the user explicitly selects **Replace**.

Groq is an independent external service. Its free-tier limits, retention practices, model availability, and terms are controlled by Groq and may change. Review its current policies before translating sensitive content.

## Data inventory

| Data               | Where it is used                                       | Persistence                                                             |
| ------------------ | ------------------------------------------------------ | ----------------------------------------------------------------------- |
| Source text        | Content script, background worker, configured provider | Not intentionally written to extension storage; provider policy applies |
| Translation result | Overlay and short session cache                        | Current extension session only                                          |
| Groq API key       | Background worker                                      | `chrome.storage.local` until removed                                    |
| Enabled preference | Popup/content behavior                                 | Chrome storage; may sync through the user's browser account             |
| Undo text          | Immediate replacement interaction                      | Short-lived memory only                                                 |

## What ToneBridge deliberately avoids

- processing password inputs;
- embedding a shared maintainer API key;
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
