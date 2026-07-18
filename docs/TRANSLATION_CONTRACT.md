# Translation Contract

The translation contract is ToneBridge's product definition. A result is successful only when it is both natural English and faithful to the original message.

## Required behavior

Convert Bangla or Banglish into natural English while preserving:

- factual meaning and intent;
- all information—nothing added and nothing omitted;
- casual, polite, formal, direct, uncertain, humorous, or emotional tone;
- emotional intensity without exaggeration or softening;
- names, numbers, URLs, brands, and technical terms unless translation is clearly intended;
- ambiguity when the source itself is ambiguous.

Return only the converted English message. Do not explain the translation.

## Prohibited transformations

ToneBridge must not:

- add advice, justification, greetings, apologies, or context;
- summarize, expand, or answer the message;
- make the writer sound more professional, polite, confident, or emotional than the source;
- remove repetition that carries emphasis;
- invent missing details;
- turn a question into a statement or change who is acting;
- silently censor rude or direct wording;
- produce multiple options unless the interface explicitly requests them.

Natural English grammar is expected, but grammar correction is a consequence of translation—not permission to rewrite the writer's idea.

## Examples

| Source                                 | Faithful English                    | Why                                                 |
| -------------------------------------- | ----------------------------------- | --------------------------------------------------- |
| `ami ajke jabo na`                     | `I won't go today.`                 | Direct and complete; no reason is invented.         |
| `apni ki details gula pathate parben?` | `Could you send the details?`       | Preserves the polite request.                       |
| `eita kaj kore nai abar check koro`    | `This didn't work. Check it again.` | Preserves the direct tone without softening it.     |
| `mone hoi kalke hote pare`             | `I think it might happen tomorrow.` | Preserves uncertainty rather than asserting a fact. |

Expected translations are often non-unique. Review should focus on semantic and tonal equivalence, not exact string identity alone.

## Evaluation dimensions

1. **Completeness:** Is every source detail present?
2. **Non-invention:** Is every output detail supported by the source?
3. **Intent:** Is the speech act—question, request, refusal, statement—unchanged?
4. **Tone:** Are formality, directness, and emotion preserved?
5. **Naturalness:** Does the result read as normal English without becoming a rewrite?
6. **Entity fidelity:** Are names, numbers, links, and domain terms preserved?

## Test data rules

Use invented examples or data with clear, compatible licensing. Never contribute private conversations, customer text, personal information, credentials, or content copied from a service without permission. Each regression example should explain the failure it is designed to detect.
