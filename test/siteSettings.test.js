import assert from 'node:assert/strict';
import test from 'node:test';
import { SITE_MODES, TRANSLATION_MODES } from '../src/shared/constants.js';
import {
  getEffectiveTranslationMode,
  getSiteMode,
  getSiteOrigin,
  updateSiteMode,
} from '../src/shared/siteSettings.js';

test('extracts only supported webpage origins', () => {
  assert.equal(getSiteOrigin('https://mail.google.com/mail/u/0/'), 'https://mail.google.com');
  assert.equal(getSiteOrigin('http://localhost:4173/test'), 'http://localhost:4173');
  assert.equal(getSiteOrigin('chrome://extensions'), null);
  assert.equal(getSiteOrigin('not a url'), null);
});

test('uses the global mode when a site has no valid override', () => {
  assert.equal(getSiteMode({}, 'https://example.com'), SITE_MODES.global);
  assert.equal(
    getEffectiveTranslationMode(TRANSLATION_MODES.manual, SITE_MODES.global),
    TRANSLATION_MODES.manual,
  );
});

test('lets a site override the global trigger mode', () => {
  const rules = { 'https://example.com': SITE_MODES.disabled };
  const siteMode = getSiteMode(rules, 'https://example.com');
  assert.equal(siteMode, SITE_MODES.disabled);
  assert.equal(
    getEffectiveTranslationMode(TRANSLATION_MODES.automatic, siteMode),
    SITE_MODES.disabled,
  );
});

test('removes stored overrides when a site returns to global behavior', () => {
  const existing = {
    'https://example.com': SITE_MODES.manual,
    'https://another.example': SITE_MODES.disabled,
  };
  const next = updateSiteMode(existing, 'https://example.com', SITE_MODES.global);

  assert.deepEqual(next, { 'https://another.example': SITE_MODES.disabled });
  assert.equal(existing['https://example.com'], SITE_MODES.manual);
});
