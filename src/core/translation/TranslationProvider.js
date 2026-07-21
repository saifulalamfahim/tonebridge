export const TRANSLATION_PROVIDER_API_VERSION = 1;

export class TranslationProvider {
  async translate() {
    throw new Error('TranslationProvider.translate must be implemented.');
  }
}
