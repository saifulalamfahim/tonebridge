import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const distPath = resolve(import.meta.dirname, '..', 'dist');
const manifest = JSON.parse(readFileSync(resolve(distPath, 'manifest.json'), 'utf8'));
const contentPath = resolve(distPath, manifest.content_scripts[0].js[0]);
const content = readFileSync(contentPath, 'utf8');

const failures = [];
const requiredFiles = [
  manifest.action.default_popup,
  manifest.background.service_worker,
  ...manifest.content_scripts.flatMap((entry) => entry.js),
];

for (const file of requiredFiles) {
  if (!existsSync(resolve(distPath, file))) failures.push(`Missing manifest target: ${file}`);
}

if (!content.startsWith('(function')) failures.push('Content script is not a standalone IIFE.');
if (/^\s*import\s/m.test(content)) failures.push('Content script contains a top-level import.');
if (content.includes('process.env'))
  failures.push('Content script contains Node process.env references.');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Extension bundle verification passed.');
}
