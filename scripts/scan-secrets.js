import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const ignoredDirectories = new Set(['.git', 'dist', 'node_modules']);
const textExtensions = new Set(['.css', '.html', '.js', '.json', '.jsx', '.md', '.yml', '.yaml']);
const signatures = [
  { name: 'Groq API key', pattern: /gsk_[A-Za-z0-9]{24,}/g },
  { name: 'OpenAI API key', pattern: /sk-(?:proj-)?[A-Za-z0-9_-]{32,}/g },
  { name: 'private key', pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
];

function walk(directory, output = []) {
  for (const name of readdirSync(directory)) {
    if (ignoredDirectories.has(name)) continue;
    const path = resolve(directory, name);
    if (statSync(path).isDirectory()) walk(path, output);
    else if (textExtensions.has(extname(name).toLowerCase())) output.push(path);
  }
  return output;
}

const failures = [];
for (const path of walk(root)) {
  const content = readFileSync(path, 'utf8');
  for (const signature of signatures) {
    if (signature.pattern.test(content))
      failures.push(`${relative(root, path)} contains a possible ${signature.name}.`);
    signature.pattern.lastIndex = 0;
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Secret scan passed.');
}
