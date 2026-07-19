export const STORAGE_KEYS = {
  enabled: 'enabled',
  groqApiKey: 'groqApiKey',
  protectedTerms: 'protectedTerms',
  stylePreferences: 'stylePreferences',
  providerId: 'providerId',
  localModel: 'localModel',
  storageSchemaVersion: 'storageSchemaVersion',
  translationMode: 'translationMode',
  siteModes: 'siteModes',
};
export const TRANSLATION_MODES = { automatic: 'automatic', manual: 'manual' };
export const SITE_MODES = {
  global: 'global',
  automatic: TRANSLATION_MODES.automatic,
  manual: TRANSLATION_MODES.manual,
  disabled: 'disabled',
};
export const DEFAULT_SETTINGS = {
  [STORAGE_KEYS.enabled]: true,
  [STORAGE_KEYS.translationMode]: TRANSLATION_MODES.automatic,
  [STORAGE_KEYS.siteModes]: {},
};
export const TRANSLATION_DELAY_MS = 650;
export const MESSAGE_TYPES = {
  translate: 'TRANSLATE_TEXT',
  translateFocusedEditor: 'TRANSLATE_FOCUSED_EDITOR',
  getSiteContext: 'GET_SITE_CONTEXT',
};
export const COMMANDS = { translateFocusedEditor: 'translate-focused-editor' };
