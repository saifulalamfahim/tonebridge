# Contributing to ToneBridge

Thank you for helping build a faithful Bangla and Banglish writing assistant. Contributions of code, tests, documentation, bug reports, accessibility improvements, and carefully designed translation examples are welcome.

## Before opening a change

1. Search existing issues and pull requests.
2. Open an issue before large features, new providers, data collection, permission changes, or architecture changes.
3. Keep each contribution focused on one problem.
4. Read the [translation contract](docs/TRANSLATION_CONTRACT.md) and [privacy model](docs/PRIVACY.md).

Small typo fixes and narrowly scoped tests do not need a planning issue.

## Local setup

```bash
git clone https://github.com/saifulalamfahim/tonebridge.git
cd tonebridge
npm install
npm run check
```

Load the generated `dist` directory as an unpacked Chrome or Edge extension for real-browser testing. See the [testing guide](docs/TESTING.md).

## Branches and commits

- Create a short branch from the latest `main`, such as `fix/contenteditable-replace` or `docs/privacy-example`.
- Write focused commits with imperative, descriptive messages.
- Do not include generated `dist/`, local API keys, browser profiles, logs, or unrelated formatting churn.
- Rebase or update the branch when a maintainer requests it; do not rewrite shared branches without coordination.

## Code expectations

- Keep page integration, UI, and provider/network responsibilities separated.
- Never expose an API key to the webpage or content script.
- Never process password fields.
- Avoid adding extension permissions unless the feature cannot be implemented safely without them.
- Preserve stale-response protection and user-controlled replacement behavior.
- Add or update tests for provider behavior and deterministic logic.
- Use comments for non-obvious reasoning, not to restate the code.

ESLint and Prettier define the repository style. Run `npm run check` before every pull request.

## Translation and dataset expectations

Translation changes must preserve meaning, intent, tone, formality, emotional intensity, and information. They must not silently make a message more polite, professional, detailed, or persuasive.

Use invented, non-sensitive fixtures. A useful case contains:

- Bangla or Banglish source text;
- faithful expected English;
- the intended tone or ambiguity;
- the specific regression the example prevents.

Do not contribute copied private messages, customer data, credentials, medical or legal records, or unlicensed datasets. Document the source and license of any proposed dataset.

## Pull request checklist

A pull request should explain:

- what changed and why;
- the user-visible effect;
- privacy, permission, and provider impact;
- automated checks that were run;
- browsers and editor types tested;
- known limitations or follow-up work.

Keep the pull request in draft while it is incomplete. Screenshots are useful for UI changes, but remove private content and credentials before uploading them.

## Review and acceptance

Maintainers may request changes for correctness, scope, privacy, accessibility, maintainability, or translation faithfulness. A passing CI run is required but does not by itself guarantee acceptance. By contributing, you agree that your work is licensed under Apache-2.0.

## Security reports

Do not disclose exploitable security or privacy issues in a public issue. Follow [SECURITY.md](SECURITY.md) and use GitHub private vulnerability reporting when available.
