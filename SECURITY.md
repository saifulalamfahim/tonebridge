# Security Policy

## Supported versions

ToneBridge is an early alpha. Security and privacy fixes are applied to the latest code on `main`; older alpha builds are not supported.

## Reporting a vulnerability

Use GitHub's **Security** tab and private vulnerability reporting when available. Do not disclose exploitable details in a public issue. If private reporting is unavailable, open a minimal public issue requesting a private maintainer contact and include no sensitive technical details.

Please include, when safe:

- the affected version or commit;
- the impacted browser and operating system;
- reproduction steps using invented data;
- likely impact and whether exploitation was observed;
- a suggested mitigation, if known.

Never include API keys, private messages, passwords, personal information, browser profiles, or live credentials in a report, screenshot, log, or reproduction.

## Security boundaries

- Password fields are excluded from processing.
- API keys must never be committed, bundled, logged, or exposed to webpages/content scripts.
- The personal-testing Groq key is stored in protected Chrome local extension storage.
- The local Ollama provider is restricted to loopback host permissions and has no hosted fallback.
- Live translation text is sent to the explicitly configured provider only after the selected trigger.
- Oversized source text is rejected before a provider request.
- CI scans source files for common committed-secret signatures and validates the release manifest allowlist.
- ToneBridge does not intentionally store translation history or operate analytics.
- New host permissions, providers, or data collection require explicit security and privacy review.

See [Privacy and data flow](docs/PRIVACY.md) for the current data model. No software can promise complete security; do not use the alpha for secrets or high-risk communication.
