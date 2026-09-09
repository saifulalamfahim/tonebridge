import { readFile } from 'node:fs/promises';
import { GroqTranslationProvider } from '../src/core/translation/GroqTranslationProvider.js';
import { LocalOpenAITranslationProvider } from '../src/core/translation/LocalOpenAITranslationProvider.js';
import { evaluateCandidate } from '../src/core/evaluation/dataset.js';

// Opt-in only: never called by CI or npm run check. Only invented dataset text
// is sent; keys are read from the environment and never printed or persisted.
const args = process.argv.slice(2);
if (!args.includes('--run')) {
  console.error('Live evaluation is opt-in: node scripts/evaluate-live.js --run [--local]');
  process.exitCode = 1;
} else if (!args.includes('--local') && !process.env.GROQ_API_KEY) {
  console.error('GROQ_API_KEY is not available. No request was sent.');
  process.exitCode = 1;
} else {
  const dataset = JSON.parse(
    await readFile(new URL('../datasets/faithfulness.v1.json', import.meta.url), 'utf8'),
  );
  const report = {
    date: new Date().toISOString(),
    provider: args.includes('--local') ? 'ollama' : 'groq',
    note: 'Mechanical checks are not proof of semantic fidelity. Review each output against its source and expected meaning.',
    cases: [],
  };
  for (const sample of dataset.cases) {
    const provider = args.includes('--local')
      ? new LocalOpenAITranslationProvider({
          model: process.env.OLLAMA_MODEL,
          protectedTerms: sample.protectedTerms,
        })
      : new GroqTranslationProvider({
          apiKey: process.env.GROQ_API_KEY,
          protectedTerms: sample.protectedTerms,
        });
    try {
      const { translation } = await provider.translate(sample.source);
      const evaluation = evaluateCandidate(sample, translation);
      report.cases.push({
        id: sample.id,
        source: sample.source,
        expected: sample.expected,
        actual: translation,
        ...evaluation,
      });
      if (!evaluation.pass) process.exitCode = 1;
    } catch (error) {
      report.cases.push({ id: sample.id, error: error.code ?? 'REQUEST_FAILED' });
      process.exitCode = 1;
      break; // Do not retry or burn quota when a provider is unavailable.
    }
  }
  console.log(JSON.stringify(report, null, 2));
}
