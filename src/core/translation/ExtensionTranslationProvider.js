import { MESSAGE_TYPES } from '../../shared/constants.js';
import { DemoTranslationProvider } from './DemoTranslationProvider.js';
import { TranslationProvider } from './TranslationProvider.js';

const demoProvider = new DemoTranslationProvider();

export class ExtensionTranslationProvider extends TranslationProvider {
  async translate(text) {
    try {
      const response = await chrome.runtime.sendMessage({ type: MESSAGE_TYPES.translate, text });
      if (response?.ok) return response.result;

      if (response?.error?.code === 'MISSING_API_KEY') {
        const demoResult = await demoProvider.translate(text);
        if (demoResult.translation) return demoResult;
        return {
          translation: '',
          message: 'Add a free Groq API key in the ToneBridge popup to translate any sentence.',
        };
      }

      return {
        translation: '',
        message: response?.error?.message ?? 'Translation failed. Please try again.',
      };
    } catch (error) {
      if (/extension context invalidated/i.test(error?.message ?? '')) {
        return {
          translation: '',
          message: 'ToneBridge was updated. Refresh this page once, then try again.',
        };
      }
      return { translation: '', message: 'ToneBridge could not reach its background service.' };
    }
  }
}
