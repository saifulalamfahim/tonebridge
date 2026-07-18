import { TranslationProvider } from './TranslationProvider.js';

const examples = new Map([
  ['ami ajke jabo na', "I won't go today."],
  ['ajke ami jabo na', "I won't go today."],
  ['ami aajke jabo na', "I won't go today."],
  ['aajke ami jabo na', "I won't go today."],
  ['আমি আজকে যাব না', "I won't go today."],
  ['আজকে আমি যাব না', "I won't go today."],
  ['ami bujhte partasina eita keno hocche', "I can't understand why this is happening."],
]);

function normalize(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[.!?]+$/u, '')
    .replace(/\s+/gu, ' ');
}

export class DemoTranslationProvider extends TranslationProvider {
  async translate(text) {
    const translation = examples.get(normalize(text)) ?? '';
    return {
      translation,
      message: translation
        ? ''
        : 'Offline demo only. Try: “ajke ami jabo na”. General translation is not connected yet.',
    };
  }
}
