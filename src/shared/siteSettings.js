import { SITE_MODES } from './constants.js';

const VALID_SITE_MODES = new Set(Object.values(SITE_MODES));

export function getSiteOrigin(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.origin : null;
  } catch {
    return null;
  }
}

export function getSiteMode(siteModes, origin) {
  const mode = origin ? siteModes?.[origin] : null;
  return VALID_SITE_MODES.has(mode) && mode !== SITE_MODES.global ? mode : SITE_MODES.global;
}

export function getEffectiveTranslationMode(globalMode, siteMode) {
  return siteMode === SITE_MODES.global ? globalMode : siteMode;
}

export function updateSiteMode(siteModes, origin, mode) {
  if (!origin || !VALID_SITE_MODES.has(mode)) return { ...siteModes };
  const next = { ...siteModes };
  if (mode === SITE_MODES.global) delete next[origin];
  else next[origin] = mode;
  return next;
}
