# v1.0 Final Acceptance

Use invented Bangla/Banglish text only. Reload the unpacked extension and refresh all test pages after installing the candidate `dist/` folder.

## Required Chrome checks

- [ ] Popup reports version 1.0.0 and the extension enables/disables cleanly.
- [ ] Groq mode translates a new sentence, then Replace, Copy, Retry, Dismiss, and Undo work.
- [ ] A standard input, textarea, and generic contenteditable each show the overlay.
- [ ] The overlay can be dragged, moved with arrow keys, reset by double-click, and never leaves the viewport.
- [ ] Automatic and Manual triggers work; the configured shortcut translates only the focused editor.
- [ ] Per-site Disabled blocks automatic and manual requests; other site choices persist after reload.
- [ ] ChatGPT composer, Gmail compose, LinkedIn comment, and LinkedIn post modal show the overlay above the website UI.
- [ ] Continuing to type during a request never shows or inserts the stale result.
- [ ] Password fields and empty fields never trigger translation.
- [ ] Invalid Groq key, offline mode, and an oversized source leave the original text unchanged and show an actionable error.
- [ ] Protected terms remain exact and spelling/contraction preferences do not add or remove information.
- [ ] Settings export contains no API key; Delete all data clears provider and user preferences.

## Required Edge checks

- [ ] Install the same `dist/` folder in Edge.
- [ ] Repeat standard input, textarea, contenteditable, Replace, Undo, Manual shortcut, and Disabled-site checks.

## Optional local-provider checks

- [ ] With Ollama running, the configured installed model translates through `127.0.0.1:11434`.
- [ ] With Ollama stopped, ToneBridge shows a local-service error and does not fall back to Groq.

The optional local checks do not block hosted-provider v1.0, but a local provider must not be advertised as validated unless they pass.
