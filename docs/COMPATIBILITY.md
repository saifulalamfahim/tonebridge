# Compatibility Baseline

This is ToneBridge's supported browser contract for v1.0. It distinguishes automated coverage from real-browser acceptance so the project does not claim compatibility that was never tested.

## Supported platforms

| Platform               | v1.0 status    | Notes                                               |
| ---------------------- | -------------- | --------------------------------------------------- |
| Google Chrome desktop  | Release target | Manifest V3 unpacked extension                      |
| Microsoft Edge desktop | Release target | Chromium Manifest V3 unpacked extension             |
| Firefox                | Out of scope   | Not on the current roadmap                          |
| Android                | Next platform  | Separate keyboard/privacy design after browser v1.0 |

The latest two stable Chrome and Edge releases are the intended support window. A release is not tagged until the current versions pass the manual matrix in [Testing](TESTING.md).

## Editor matrix

| Editor surface            | Expected support              | Automated evidence                               | Manual release check              |
| ------------------------- | ----------------------------- | ------------------------------------------------ | --------------------------------- |
| Standard text input       | Supported                     | editor resolution and replacement tests          | Required                          |
| Textarea                  | Supported                     | editor resolution and replacement tests          | Required                          |
| Generic contenteditable   | Supported                     | nested-host and replacement tests                | Required                          |
| ChatGPT composer          | Supported target              | rich-editor event/reload regression tests        | Required                          |
| Gmail compose             | Supported target              | generic rich-editor behavior                     | Required                          |
| LinkedIn comment          | Supported target              | generic rich-editor behavior                     | Required                          |
| LinkedIn post modal       | Supported target              | retargeted modal event and maximum overlay layer | Required                          |
| Password input            | Intentionally blocked         | editor exclusion logic                           | Required                          |
| Browser-internal pages    | Unsupported by browser design | manifest boundary                                | Not applicable                    |
| Closed website Shadow DOM | Not guaranteed                | none                                             | Report with a public reproduction |

Website updates can change an editor without notice. A compatibility claim means ToneBridge will treat a reproducible regression on the named surface as a supported bug; it does not mean the website vendor endorses the extension.

## Performance boundaries

- automatic requests wait 650 ms after typing;
- results are cached only in memory and capped at 50 entries per content-script session;
- source text is capped at 8,000 characters before any provider request;
- Groq requests time out after 20 seconds and local Ollama requests after 60 seconds;
- stale results are ignored if the editor or source text changes.
