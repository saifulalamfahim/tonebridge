import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  COMMANDS,
  DEFAULT_SETTINGS,
  STORAGE_KEYS,
  TRANSLATION_MODES,
} from '../src/shared/constants.js';

const manifest = JSON.parse(
  readFileSync(new URL('../public/manifest.json', import.meta.url), 'utf8'),
);

test('uses automatic translation as the backwards-compatible default', () => {
  assert.equal(DEFAULT_SETTINGS[STORAGE_KEYS.enabled], true);
  assert.equal(DEFAULT_SETTINGS[STORAGE_KEYS.translationMode], TRANSLATION_MODES.automatic);
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
});
