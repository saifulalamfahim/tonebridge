import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { evaluateCandidate, validateDataset } from '../src/core/evaluation/dataset.js';

const dataset = JSON.parse(
  await readFile(new URL('../datasets/faithfulness.v1.json', import.meta.url), 'utf8'),
);

test('ships a valid, invented, balanced faithfulness dataset', () => {
  const result = validateDataset(dataset);
  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
});

test('candidate checks catch lost entities and unsupported politeness', () => {
  const testCase = {
    intent: 'statement',
    protectedTerms: ['React 19'],
    forbiddenTerms: ['please'],
  };

  assert.equal(evaluateCandidate(testCase, 'The React 19 build failed.').pass, true);
  const failed = evaluateCandidate(testCase, 'Please check the build.');
  assert.equal(failed.pass, false);
  assert.equal(failed.checks.protectedTerms, false);
  assert.equal(failed.checks.forbiddenTerms, false);
});

test('question cases retain a question signal', () => {
  const testCase = { intent: 'question', protectedTerms: [], forbiddenTerms: [] };
  assert.equal(evaluateCandidate(testCase, 'Will this work?').pass, true);
  assert.equal(evaluateCandidate(testCase, 'This will work.').checks.questionSignal, false);
});
