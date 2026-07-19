# Changelog

All notable project changes are documented here. ToneBridge follows semantic versioning once compatibility guarantees stabilize; alpha versions may still change interfaces.

## Unreleased

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
- ordered editor-adapter registry with dedicated ChatGPT and Gmail detection
- native input and rich-content replacement paths that notify host frameworks
- nested editing-host resolution, predictable caret placement, and detached-editor cleanup
- deterministic adapter-selection and replacement tests

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
