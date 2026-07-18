# Security Policy

## Supported versions

ToneBridge is in an early alpha stage. Security fixes are applied to the latest version on the `main` branch.

## Reporting a vulnerability

Do not disclose exploitable security or privacy issues in a public issue. Use GitHub's private vulnerability reporting feature from the repository **Security** tab when available. If that option is unavailable, open a minimal issue asking the maintainer for a private contact channel without including sensitive details.

Never include API keys, private messages, passwords, or personal information in a report, screenshot, log, fixture, or reproduction.

## Sensitive data model

- Password fields are never processed.
- API keys must not be committed or embedded in a public extension.
- The current personal-testing key is stored in Chrome local extension storage.
- Live translation text is sent to the configured provider only after the typing debounce.
- ToneBridge does not intentionally store translation history.
