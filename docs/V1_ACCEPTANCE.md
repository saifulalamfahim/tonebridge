# v1.0 Final Acceptance

Use invented Bangla/Banglish text only. Reload the unpacked extension and refresh all test pages after installing the candidate `dist/` folder.

## Required Chrome checks

- [x] Popup reports version 1.0.0 and the extension enables/disables cleanly.
- [x] Groq mode translates a new sentence, then Replace, Copy, Retry, Dismiss, and Undo work.
- [x] A standard input, textarea, and generic contenteditable each show the overlay.
- [x] The overlay can be dragged, moved with arrow keys, reset by double-click, and never leaves the viewport.
- [x] Automatic and Manual triggers work; the configured shortcut translates only the focused editor.
- [x] In Manual mode, the result remains visible after every shortcut key is released.
- [x] Per-site Disabled blocks automatic and manual requests; other site choices persist after reload.
- [x] ChatGPT composer, Gmail compose, LinkedIn comment, and LinkedIn post modal show the overlay above the website UI.
- [x] Fiverr messaging shows **This site** controls and its embedded editor follows the top-level Fiverr site rule.
- [x] Continuing to type during a request never shows or inserts the stale result.
- [x] Password fields and empty fields never trigger translation.
- [x] Invalid Groq key, offline mode, and an oversized source leave the original text unchanged and show an actionable error.
- [x] Protected terms remain exact and spelling/contraction preferences do not add or remove information.
- [x] Settings export contains no API key; Delete all data clears provider and user preferences.

## Required Edge checks

- [x] Install the same `dist/` folder in Edge.
- [x] Repeat standard input, textarea, contenteditable, Replace, Undo, Manual shortcut, and Disabled-site checks.

## Optional local-provider checks

- [ ] With Ollama running, the configured installed model translates through `127.0.0.1:11434`.
- [ ] With Ollama stopped, ToneBridge shows a local-service error and does not fall back to Groq.

The optional local checks do not block hosted-provider v1.0, but a local provider must not be advertised as validated unless they pass.
