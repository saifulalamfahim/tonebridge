# Release Process

ToneBridge uses a maintainer-controlled release gate. A version number in source code is a release candidate until every required item is complete; only a signed-off tag and GitHub release make it an official release.

## Automated gate

From a clean checkout:

```bash
npm ci
npm run release:check
```

This verifies formatting, linting, secret signatures, the invented evaluation dataset, unit tests, production builds, manifest targets, host-permission allowlists, trusted-context storage, and version alignment. GitHub Actions uploads the verified `dist/` directory as a short-lived artifact for review.

## Manual gate

Complete every applicable item in [v1 acceptance](V1_ACCEPTANCE.md) on current Chrome and Edge. Use invented text and a personal free-tier key or local model. Record browser versions and sanitized results in the release pull request.

## Publish

1. Confirm the release pull request is green and reviewed.
2. Replace the pending changelog label with the release date.
3. Merge without bypassing branch protection.
4. Tag the merge commit as `v1.0.0`.
5. Create a GitHub release from that tag and attach the verified CI artifact.
6. Reinstall the released package once and repeat a short standard-input smoke test.

Never publish a maintainer API key, browser profile, private message, or unverified build.
