# Android Direction After v1.0

ToneBridge's next client is planned as an Android input method, not a browser-extension port. A system keyboard can observe highly sensitive text, so implementation starts only after a separate threat model and consent design are reviewed.

The first Android milestone should:

- exclude password, payment, and other sensitive input variations;
- show when text will leave the device and which provider receives it;
- default to an explicit user action rather than sending every keystroke;
- reuse the versioned translation contract, protected vocabulary, and provider result shape;
- offer deletion and inspectable local settings from the beginning;
- support local processing when practical without silently falling back to a hosted service;
- contain no advertising, analytics, hidden history, or bundled maintainer credential.

Android work will live behind a documented client boundary so browser stability and release maintenance are not disrupted.
