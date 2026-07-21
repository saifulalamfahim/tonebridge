# Changelog

All notable project changes are documented here. ToneBridge follows semantic versioning from v1.0 onward; older alpha versions may change interfaces without compatibility guarantees.

## 1.0.0 — 2026-07-21

### Added

- draggable overlay positioning with mouse, pointer, and keyboard controls
- viewport boundaries that prevent the overlay from being lost off-screen
- double-click reset that returns a moved overlay beside its active editor
- deterministic overlay-positioning tests
- automatic and manual translation trigger modes
- configurable focused-editor shortcut with `Alt+Shift+E` as the suggested default
- settings migration that preserves existing user choices while adding new defaults
- per-site global, automatic, manual-only, and disabled behavior
- trusted-context storage isolation that prevents content scripts from reading provider keys
- deterministic site-rule and storage-isolation tests
- a 30-case invented Bangla/Banglish faithfulness dataset and deterministic validation
- protected vocabulary plus explicit spelling and contraction preferences
- non-secret settings export and complete local-data deletion
- optional loopback-only Ollama provider with explicit selection and no Groq fallback
- versioned storage migrations, an 8,000-character source limit, and bounded provider requests
- keyboard focus indicators, semantic status/error announcements, and reduced-motion behavior
- repository secret scanning, manifest allowlist checks, and a verified CI build artifact
- manual shortcut results that remain visible after shortcut-key release
- top-level site-rule inheritance for editors embedded in website frames
- clearer protected-vocabulary and complete-settings export explanations

### Changed

- Groq and local providers now share one inspectable faithfulness prompt and normalized result contract
- the roadmap now targets stable Chrome/Edge followed by Android; Firefox is out of current scope

## 0.3.0-alpha — 2026-07-18

### Added

- Chrome/Edge Manifest V3 extension foundation built with React, Vite, and JavaScript
- floating Shadow DOM translation overlay for standard inputs, textareas, and basic contenteditable elements
- explicit replace, copy, retry, dismiss, and short-lived undo interactions
- debounced translation requests, session caching, and stale-response protection
- optional Groq live translation with a user-supplied key stored in Chrome local storage
- deterministic offline demonstration for three sample sentences
- translation-provider abstraction and mocked provider tests
- ESLint, Prettier, build verification, and GitHub Actions CI
- Apache-2.0 license and contributor, security, privacy, architecture, provider, testing, roadmap, and community documentation

### Security

- provider keys remain in the privileged background context and are never injected into webpages
- password inputs are excluded from processing
- translation history and analytics are not stored by ToneBridge
