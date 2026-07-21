import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validateDataset } from '../src/core/evaluation/dataset.js';

const datasetPath = resolve(import.meta.dirname, '..', 'datasets', 'faithfulness.v1.json');
const dataset = JSON.parse(await readFile(datasetPath, 'utf8'));
const result = validateDataset(dataset);

if (!result.valid) {
  console.error(result.errors.join('\n'));
  process.exitCode = 1;
} else {
  const counts = result.summary.sourceCounts;
  console.log(
    `Dataset validation passed: ${result.summary.cases} invented cases ` +
      `(${counts.bangla} Bangla, ${counts.banglish} Banglish, ${counts.mixed} mixed).`,
  );
}
