# Roadmap

ToneBridge is developed in small, testable milestones. This roadmap communicates direction, not delivery dates or a promise that every item will ship unchanged.

## v0.3 — Usable alpha (current)

- Chrome/Edge Manifest V3 foundation
- input, textarea, and basic contenteditable support
- isolated floating translation overlay
- replace, copy, retry, dismiss, and short-lived undo
- Groq free-tier, user-supplied API key integration
- provider abstraction, offline demo, tests, CI, and open-source documentation

## v0.4 — Browser reliability

- draggable, viewport-bounded overlay positioning (implemented)
- automatic/manual trigger modes and configurable focused-editor shortcut (implemented)
- improve complex editor compatibility through adapters
- better overlay positioning during scroll, resize, and dynamic layout changes
- keyboard-first interactions and accessibility review
- clearer site controls and per-site disable behavior
- expand deterministic browser and provider tests

## v0.5 — Faithfulness and personalization foundations

- public, licensed evaluation dataset with invented Bangla/Banglish cases
- structured evaluation for meaning, tone, completeness, and non-invention
- custom vocabulary and protected terms
- explicit, inspectable style preferences
- consent, retention, export, and deletion design before any style learning
- optional self-hosted or local open-source provider prototype

## v1.0 — Stable browser release

- documented compatibility baseline
- stable provider interface and migration policy
- Firefox support where APIs permit
- hardened privacy controls and release process
- accessibility and performance targets
- contributor governance appropriate to project growth

## Later platform exploration

Android keyboard, Windows-wide input, iOS keyboard, and macOS input-method clients may reuse the translation core after the browser experience and privacy model are stable. Platform-wide keyboards introduce significantly higher privacy and security risk and are intentionally not part of the early milestones.

## Non-goals for the current project

- autonomous message writing or reply generation;
- general grammar polishing unrelated to translation;
- automatic acceptance of model output;
- hidden data collection or training on private messages;
- guaranteeing that a third-party free tier remains available.

Propose roadmap changes through a GitHub issue with user value, scope, privacy impact, alternatives, and a test strategy.
