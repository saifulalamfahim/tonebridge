# ToneBridge Evaluation Dataset

`faithfulness.v1.json` contains invented Bangla, Banglish, and mixed-language examples for evaluating ToneBridge's translation contract. The dataset is part of ToneBridge and is licensed under Apache-2.0.

No example comes from a private conversation, customer message, medical or legal record, third-party service, or scraped corpus. Contributors must follow the same rule.

The reference English is not the only acceptable translation. It documents a faithful target and supplies deterministic constraints. Automated checks cover structure, language, protected terms, prohibited additions, and question signals. Human or model-assisted review is still required for meaning, tone, completeness, non-invention, and naturalness.

Run:

```bash
npm run eval:dataset
```

When adding a case, explain its risk with `riskTags`, preserve sensitive entities through `protectedTerms`, and list only clearly unsupported output terms in `forbiddenTerms`.
