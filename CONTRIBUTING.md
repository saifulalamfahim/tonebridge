# Contributing to ToneBridge

Thank you for helping build a faithful Bangla and Banglish writing assistant.

## Before you begin

- Search existing issues before proposing a change.
- Keep changes focused and explain their user impact.
- Never include private messages, credentials, or paid service keys in tests or examples.
- Translation changes must not add information, remove information, or silently change tone.

## Development workflow

1. Fork the repository and create a branch from `main`.
2. Install dependencies with `npm install`.
3. Make the smallest complete change.
4. Run `npm run check`.
5. Test the unpacked `dist` extension in Chrome or Edge.
6. Open a pull request describing what was tested and known limitations.

## Code and translation quality

ESLint and Prettier define code style. Do not disable rules without explaining why. Use invented, non-sensitive translation cases. A useful case includes source text, faithful expected English, tone, and the failure it prevents. Avoid turning translation fixtures into rewriting or grammar-polishing examples.

## Security reports

Do not publish exploitable privacy or security details in a public issue. Until a dedicated security contact exists, open a minimal issue requesting private maintainer contact without including sensitive details.
