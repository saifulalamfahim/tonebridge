# Testing Guide

ToneBridge combines deterministic provider logic with browser APIs and website editor behavior. Both automated and real-browser testing are required.

## Automated checks

Run the complete local gate:

```bash
npm install
npm run check
```

The gate runs ESLint, Prettier verification, Node provider tests, production builds, and bundle verification. Tests must not require a real API key or paid request.

Validate the public invented evaluation dataset independently with `npm run eval:dataset`. This command is also part of the complete check gate.

## Real-browser smoke test

1. Run `npm run build`.
2. Load `dist/` as an unpacked extension in Chrome or Edge.
3. Reload the extension after every build and refresh the test page.
4. Verify a standard input, textarea, and basic contenteditable element.
5. Select **Automatic**, type invented text, and confirm the overlay appears after the debounce.
6. Select **Manual**, type different invented text, wait, and confirm no overlay or provider request appears.
7. Keep the editor focused, press the shortcut shown in the popup, and confirm the overlay appears for the current text.
8. Open `chrome://extensions/shortcuts`, assign another shortcut, and confirm the popup and command use it.
9. Set **This site** to **Disabled** and confirm neither typing nor the shortcut creates an overlay or request.
10. Test **Manual only**, **Automatic**, and **Use global**, then reload the page and confirm each saved rule persists.
11. Confirm browser-internal pages show that site controls are unavailable.
12. Confirm **Replace**, **Copy**, **Retry**, **Dismiss**, and **Undo** behave correctly.
13. Continue typing while a request is in flight and confirm an older result never replaces the newest suggestion.
14. Confirm password fields never trigger the overlay.
15. Test without a key, with an invalid key, while offline, and after rate limiting where safely reproducible.
16. Confirm no credentials or message text appear in page DevTools logs.

Use an invented public test sentence. Do not test with a private conversation or secret.

## Translation review

For translation changes, evaluate completeness, non-invention, intent, tone, naturalness, and entity preservation as defined by the [translation contract](TRANSLATION_CONTRACT.md). Exact string equality alone is insufficient because multiple faithful English translations may exist.

## Compatibility reports

An editor bug report should include:

- browser and version;
- operating system;
- public page URL or minimal HTML reproduction;
- editor type if known;
- exact steps using invented text;
- expected and actual behavior;
- sanitized console error, when present.

Do not upload browser profiles, API keys, private messages, or screenshots containing personal data.

## Release gate

Before tagging a release:

- `npm run check` passes from a clean checkout;
- `dist/` is not committed;
- version numbers and changelog agree;
- documentation reflects current behavior and limitations;
- a secret scan finds no credentials;
- Chrome and Edge smoke tests pass for the supported editor types.
