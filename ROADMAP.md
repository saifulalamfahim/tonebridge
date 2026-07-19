# Roadmap

ToneBridge is developed in testable milestones. Versions describe achieved stability, not the number of features or a delivery date.

## Completed browser foundations

### v0.3 — Working extension

- Chrome/Edge Manifest V3 foundation
- standard inputs, textareas, and contenteditable editors
- faithful translation overlay with replace, copy, retry, dismiss, and undo
- user-supplied Groq integration, tests, CI, and open-source documentation

### v0.4 — Editor reliability and control

- draggable, viewport-bounded, keyboard-movable overlay
- automatic/manual triggers and a configurable focused-editor shortcut
- per-site controls and trusted-context credential isolation
- ChatGPT, Gmail, and LinkedIn-oriented rich-editor compatibility fixes

### v0.5–v0.8 — Faithfulness, user control, and providers

- versioned invented Bangla/Banglish evaluation dataset
- protected vocabulary and explicit spelling/contraction preferences
- export and full deletion of locally stored user settings
- optional loopback-only Ollama provider with no hosted fallback

## v0.9 — Release hardening

- storage schema migrations for safe upgrades
- source-length limits, bounded session cache, narrow host permissions, and secret scanning
- keyboard focus visibility, semantic status/error announcements, and reduced-motion support
- reproducible CI build artifact and documented release gates

## v1.0 — Stable Chrome/Edge release

- documented browser/editor compatibility baseline
- stable translation/provider contract and migration policy
- reviewed privacy, security, accessibility, and performance behavior
- reproducible release package, changelog, installation guide, and acceptance matrix

Stable means the documented behaviors are supported and upgrade-safe. It does not mean every website editor or every local model is guaranteed.

## After v1.0 — Android

The next client is an Android input method/keyboard that can reuse the translation contract and provider boundary. Work will start with threat modeling, password-field exclusion, explicit network indicators, and a local-processing path before system-wide text access is implemented. Firefox is not in the current roadmap.

## Non-goals

- autonomous message or reply writing;
- general grammar polishing unrelated to translation;
- automatic acceptance of model output;
- hidden collection or training on private messages;
- guaranteeing availability or quality of a third-party free tier;
- exposing a local provider to the LAN through ToneBridge.

Propose roadmap changes through a GitHub issue with user value, scope, privacy impact, alternatives, and a test strategy.
