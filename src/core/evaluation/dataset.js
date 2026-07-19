const SOURCE_KINDS = new Set(['bangla', 'banglish', 'mixed']);
const INTENTS = new Set(['statement', 'question', 'request', 'refusal', 'instruction']);
const TONES = new Set(['casual', 'direct', 'polite', 'formal', 'uncertain', 'emotional']);
const BENGALI_PATTERN = /[\u0980-\u09ff]/u;

function includesText(value, term) {
  return value.toLocaleLowerCase('en').includes(term.toLocaleLowerCase('en'));
}

export function evaluateCandidate(testCase, candidate) {
  const output = candidate.trim();
  const checks = {
    nonEmpty: output.length > 0,
    englishOnly: !BENGALI_PATTERN.test(output),
    protectedTerms: testCase.protectedTerms.every((term) => includesText(output, term)),
    forbiddenTerms: testCase.forbiddenTerms.every((term) => !includesText(output, term)),
    questionSignal: testCase.intent !== 'question' || output.endsWith('?'),
  };

  return { pass: Object.values(checks).every(Boolean), checks };
}

export function validateDataset(dataset) {
  const errors = [];
  if (dataset.license !== 'Apache-2.0') errors.push('Dataset license must be Apache-2.0.');
  if (!dataset.provenance?.toLocaleLowerCase('en').includes('invented'))
    errors.push('Dataset provenance must state that examples are invented.');
  if (!Array.isArray(dataset.cases) || dataset.cases.length < 25)
    errors.push('Dataset must contain at least 25 cases.');

  const ids = new Set();
  const sourceCounts = { bangla: 0, banglish: 0, mixed: 0 };
  const intentCounts = new Map();

  for (const [index, testCase] of (dataset.cases ?? []).entries()) {
    const label = testCase.id || `case ${index + 1}`;
    if (!testCase.id || ids.has(testCase.id)) errors.push(`${label}: id must be unique.`);
    ids.add(testCase.id);
    if (!testCase.source?.trim()) errors.push(`${label}: source is required.`);
    if (!testCase.expected?.trim()) errors.push(`${label}: expected English is required.`);
    if (!SOURCE_KINDS.has(testCase.sourceKind)) errors.push(`${label}: invalid sourceKind.`);
    else sourceCounts[testCase.sourceKind] += 1;
    if (!INTENTS.has(testCase.intent)) errors.push(`${label}: invalid intent.`);
    else intentCounts.set(testCase.intent, (intentCounts.get(testCase.intent) ?? 0) + 1);
    if (!TONES.has(testCase.tone)) errors.push(`${label}: invalid tone.`);
    if (!Array.isArray(testCase.protectedTerms) || !Array.isArray(testCase.forbiddenTerms))
      errors.push(`${label}: protectedTerms and forbiddenTerms must be arrays.`);
    if (!Array.isArray(testCase.riskTags) || testCase.riskTags.length === 0)
      errors.push(`${label}: at least one riskTag is required.`);
    if (BENGALI_PATTERN.test(testCase.expected ?? ''))
      errors.push(`${label}: expected output must not contain Bengali script.`);
    if (testCase.sourceKind === 'bangla' && !BENGALI_PATTERN.test(testCase.source ?? ''))
      errors.push(`${label}: Bangla cases must contain Bengali script.`);

    const result = evaluateCandidate(
      {
        ...testCase,
        protectedTerms: testCase.protectedTerms ?? [],
        forbiddenTerms: testCase.forbiddenTerms ?? [],
      },
      testCase.expected ?? '',
    );
    for (const [check, passed] of Object.entries(result.checks))
      if (!passed) errors.push(`${label}: reference output fails ${check}.`);
  }

  if (sourceCounts.bangla < 8 || sourceCounts.banglish < 8 || sourceCounts.mixed < 4)
    errors.push('Dataset needs at least 8 Bangla, 8 Banglish, and 4 mixed cases.');
  for (const intent of INTENTS)
    if (!intentCounts.get(intent)) errors.push(`Dataset needs at least one ${intent} case.`);

  return { valid: errors.length === 0, errors, summary: { cases: ids.size, sourceCounts } };
}
