import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  COMMANDS,
  DEFAULT_SETTINGS,
  SITE_MODES,
  STORAGE_KEYS,
  TRANSLATION_MODES,
} from '../src/shared/constants.js';

const manifest = JSON.parse(
  readFileSync(new URL('../public/manifest.json', import.meta.url), 'utf8'),
);

test('uses automatic translation as the backwards-compatible default', () => {
  assert.equal(DEFAULT_SETTINGS[STORAGE_KEYS.enabled], true);
  assert.equal(DEFAULT_SETTINGS[STORAGE_KEYS.translationMode], TRANSLATION_MODES.automatic);
  assert.deepEqual(DEFAULT_SETTINGS[STORAGE_KEYS.siteModes], {});
});

test('declares a configurable focused-editor translation command', () => {
  const command = manifest.commands[COMMANDS.translateFocusedEditor];

  assert.ok(command);
  assert.equal(command.suggested_key.default, 'Alt+Shift+E');
  assert.equal(command.suggested_key.mac, 'Command+Shift+E');
  assert.match(command.description, /focused editor/i);
});

test('keeps extension permissions minimal', () => {
  assert.deepEqual(manifest.permissions, ['storage']);
  assert.deepEqual(manifest.host_permissions, [
    'https://api.groq.com/*',
    'http://127.0.0.1:11434/*',
    'http://localhost:11434/*',
  ]);
});

test('injects the editor bridge into embedded writing frames', () => {
  const [contentScript] = manifest.content_scripts;
  assert.equal(contentScript.all_frames, true);
  assert.equal(contentScript.match_about_blank, true);
});

test('keeps the disabled site mode distinct from translation trigger modes', () => {
  assert.equal(SITE_MODES.automatic, TRANSLATION_MODES.automatic);
  assert.equal(SITE_MODES.manual, TRANSLATION_MODES.manual);
  assert.equal(SITE_MODES.disabled, 'disabled');
});

test('restricts local secret storage to trusted extension contexts', () => {
  const worker = readFileSync(
    new URL('../src/background/service-worker.js', import.meta.url),
    'utf8',
  );
  assert.match(worker, /setAccessLevel\(\{ accessLevel: 'TRUSTED_CONTEXTS' \}\)/);
  assert.match(worker, /STORAGE_KEYS\.protectedTerms/);
});
