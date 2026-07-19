# Editor Adapter Guide

ToneBridge uses ordered editor adapters so website-specific behavior remains separate from the translation overlay and provider code. This avoids scattering selectors and replacement workarounds through the controller.

## Current adapters

The registry in `src/content/editorAdapters.js` checks adapters in this order:

1. ChatGPT composer;
2. Gmail compose body;
3. standard input or textarea;
4. generic contenteditable fallback.

Site-specific adapters must appear before generic adapters. Detection uses stable semantics such as hostname, editor ID, `role="textbox"`, and `contenteditable`; avoid generated class names whenever possible.

## Adapter contract

Each adapter provides:

- `id`: a stable diagnostic identifier;
- `matches(element, context)`: a side-effect-free eligibility check;
- `read(element)`: the visible source text used for stale-response protection;
- `replace(element, text)`: a user-initiated, framework-compatible full-editor replacement.

The public facade in `src/content/editor.js` resolves nested event targets to the real editing host before it calls an adapter.

## Replacement requirements

An adapter must:

- reject password, disabled, and read-only fields;
- focus the editor only when the user accepts a suggestion;
- notify the host framework through normal input behavior;
- place the caret predictably after replacement;
- preserve line breaks where the editor supports them;
- never submit or send the message;
- allow the controller to verify that the editor remains connected and unchanged.

Standard controls use their native value setter followed by `input` and `change` events. Rich editors first select their contents and use the browser editing command so frameworks such as ProseMirror and Gmail can process the edit and retain an undo transaction. A text-node replacement plus an `input` event is the fallback when that command is unavailable.

## Adding another website

1. Add a narrowly scoped adapter before the generic fallback.
2. Prefer semantic attributes and document why each selector is expected to remain stable.
3. Reuse shared read and replacement behavior unless the editor genuinely requires a different transaction.
4. Add invented, deterministic unit fixtures without copying private messages or proprietary page content.
5. Test typing, replacement, undo, cursor placement, editor removal, and stale responses in a real browser.
6. Update the compatibility documentation and privacy analysis.

Do not add broad page-level DOM scraping, generated-class selectors, automatic send behavior, or private production-page snapshots.
