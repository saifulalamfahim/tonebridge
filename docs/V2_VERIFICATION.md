# ToneBridge v2 verification

Release candidate: `2.0.0-rc.1`. Scope: desktop Chrome and Edge; no Firefox or Android release in this change. No Web Store purchase, paid service, or maintainer API key is included.

## What changed

The translation contract now explicitly requires minimal grammar/spelling correction without new facts, answers, advice, greetings, or explanations. It preserves speaker, recipient, negation, tense, uncertainty, amounts, deadlines, paragraph structure, and tone. Both Groq and local Ollama use the same contract.

Output validation rejects truncated completions, empty/malformed responses, changed protected vocabulary or URLs, and common translation-label commentary. This is a conservative mechanical guard, not a second model or a semantic guarantee. Retry requests a new suggestion; the original editor is only changed by Replace.

Controller fixes bind each suggestion to its source editor and current text, ignore intermediate IME composition events, invalidate results after settings changes, suppress replacement-generated input events, and reject stale asynchronous responses. The background also checks disabled controls before starting a provider request. Disabling does not retract a request already sent.

## Reproduce verification

### Recorded local result — 2026-09-09

| Check                                                    | Result                                                               |
| -------------------------------------------------------- | -------------------------------------------------------------------- |
| ESLint and Prettier                                      | Pass                                                                 |
| Repository secret-pattern scan                           | Pass                                                                 |
| Invented dataset structural validation                   | 30 cases pass (not a live AI score)                                  |
| Deterministic unit tests                                 | 55/55 pass                                                           |
| Isolated Chromium browser tests                          | 15/15 pass                                                           |
| Production MV3 package                                   | Loads, injects, opens popup, enforces disabled/missing-key responses |
| Production build and manifest/bundle checks              | Pass                                                                 |
| npm dependency audit, including development dependencies | 0 known vulnerabilities at check time                                |
| Live Groq evaluation                                     | Not run: no GROQ_API_KEY available to the runner; no request sent    |
| Logged-in third-party sites / current Edge               | Not freshly verified for v2                                          |

The browser suite caught an actual rich-editor newline inflation bug during development. After switching multiline native insertion to explicit line breaks, Replace/Undo and real keyboard editing checks pass. The first cold-browser run also hit setup timeouts; the suite now uses one worker and a 60-second per-test budget. The recorded passing run used no retries.

```sh
npm ci
npm run check
npx playwright install chromium
npm run test:browser
npm audit
```

Browser tests use an isolated Chromium profile, invented text, the actual editor module and React overlay/controller, and a synthetic extension messaging provider. A separate production-package test loads the built MV3 extension and checks injection, popup loading, and background controls without a provider key. These tests verify editing behavior and extension wiring, not the linguistic quality of an AI model. They do not log into ChatGPT, LinkedIn, Gmail, or Fiverr.

## Live translation evaluation

```sh
# Supply your own free-tier GROQ_API_KEY in the environment, not in source code.
node scripts/evaluate-live.js --run
# Or start an installed local model and supply OLLAMA_MODEL:
node scripts/evaluate-live.js --run --local
```

Only the 30 invented dataset cases are sent. The runner stops on provider failure and does not retry automatically. Its output contains source, reference, actual output, and mechanical check results. Review meaning, omissions/additions, grammar, spelling, and tone manually; exact string matching is not an adequate translation-quality metric. Provider usage remains subject to the user's chosen account limits and terms.

## Release limitations

- A working live Groq credential or local Ollama model was not available to the automated runner. No live fidelity pass rate is claimed.
- Synthetic Chromium regressions do not certify every version of third-party editors. Live logged-in ChatGPT, LinkedIn post/comment, Gmail, Fiverr messaging, and a current Edge acceptance pass remain separate checks.
- Closed shadow-root editors, native dialog/top-layer UI, site-specific editing models, and website updates can require additional compatibility work. Use Copy when a website rejects Replace.
- Chrome Web Store publication requires a separate developer account/payment and review. This candidate can be installed free through Load unpacked. Do not upload a personal API key or browser profile with a release.

The historical v1 acceptance document records earlier checks; it is not evidence of a fresh v2 site test. Keep this candidate designation until live acceptance is recorded.

## Install the candidate without a store fee

For an existing unpacked installation pointing to this project's `dist` folder, open `chrome://extensions` (or `edge://extensions`), reload ToneBridge, then refresh the webpage. Keep the same installation/path to preserve its saved settings.

For a new installation, extract the extension release ZIP into a permanent folder. Enable Developer mode, choose Load unpacked, and select the extracted folder containing `manifest.json`. A ZIP cannot be installed directly with Load unpacked. Configure your own provider; no API credentials are shipped. Developer-mode distribution is not the same as a Chrome Web Store listing.
