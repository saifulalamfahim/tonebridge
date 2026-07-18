export const STORAGE_KEYS = {
  enabled: 'enabled',
  groqApiKey: 'groqApiKey',
  translationMode: 'translationMode',
};
export const TRANSLATION_MODES = { automatic: 'automatic', manual: 'manual' };
export const DEFAULT_SETTINGS = {
  [STORAGE_KEYS.enabled]: true,
  [STORAGE_KEYS.translationMode]: TRANSLATION_MODES.automatic,
};
export const TRANSLATION_DELAY_MS = 650;
export const MESSAGE_TYPES = {
  translate: 'TRANSLATE_TEXT',
  translateFocusedEditor: 'TRANSLATE_FOCUSED_EDITOR',
};
export const COMMANDS = { translateFocusedEditor: 'translate-focused-editor' };
