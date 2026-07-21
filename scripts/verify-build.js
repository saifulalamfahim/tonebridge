import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const distPath = resolve(import.meta.dirname, '..', 'dist');
const manifest = JSON.parse(readFileSync(resolve(distPath, 'manifest.json'), 'utf8'));
const contentPath = resolve(distPath, manifest.content_scripts[0].js[0]);
const content = readFileSync(contentPath, 'utf8');
const backgroundPath = resolve(distPath, manifest.background.service_worker);
const background = readFileSync(backgroundPath, 'utf8');
const packageMetadata = JSON.parse(
  readFileSync(resolve(import.meta.dirname, '..', 'package.json'), 'utf8'),
);

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
if (!manifest.commands?.['translate-focused-editor'])
  failures.push('Manifest is missing the focused-editor translation command.');
if (!background.includes('TRUSTED_CONTEXTS'))
  failures.push('Background bundle does not restrict local secret storage access.');
if (manifest.version !== packageMetadata.version)
  failures.push('Manifest and package versions do not match.');
const allowedHosts = new Set([
  'https://api.groq.com/*',
  'http://127.0.0.1:11434/*',
  'http://localhost:11434/*',
]);
if (manifest.host_permissions.some((host) => !allowedHosts.has(host)))
  failures.push('Manifest contains an unreviewed provider host permission.');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Extension bundle verification passed.');
}
