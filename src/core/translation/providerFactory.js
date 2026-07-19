import { normalizeProviderId, PROVIDER_IDS } from '../../shared/preferences.js';
import { GroqTranslationProvider } from './GroqTranslationProvider.js';
import { LocalOpenAITranslationProvider } from './LocalOpenAITranslationProvider.js';

export function createTranslationProvider({ providerId, groqApiKey, localModel, ...shared }) {
  if (normalizeProviderId(providerId) === PROVIDER_IDS.local)
    return new LocalOpenAITranslationProvider({ model: localModel, ...shared });
  return new GroqTranslationProvider({ apiKey: groqApiKey, ...shared });
}
