import { normalizeProtectedTerms } from '../../shared/preferences.js';

export class TranslationQualityError extends Error {
  constructor(message, code = 'INVALID_RESPONSE') {
    super(message);
    this.name = 'TranslationQualityError';
    this.code = code;
  }
}

export function completionBudget(text) {
  // Enough room for long Bengali input and the provider's internal reasoning.
  return Math.min(8192, Math.max(2048, Math.ceil(text.length * 1.5)));
}

export function validateTranslation(data, source, protectedTerms = []) {
  const choice = data?.choices?.[0];
  if (choice?.finish_reason && choice.finish_reason !== 'stop')
    throw new TranslationQualityError(
      'The provider did not finish the translation. Try a shorter passage or retry. Your text was not changed.',
      'INCOMPLETE_TRANSLATION',
    );
  const raw = choice?.message?.content;
  if (typeof raw !== 'string' || !raw.trim())
    throw new TranslationQualityError('The provider returned no usable English text. Try again.');
  const translation = raw.trim();
  if (
    /^(?:here(?:'s| is) (?:the|your) (?:english )?translation\s*:|translation\s*:|<think>)/iu.test(
      translation,
    ) &&
    !/^(?:here|translation|<think>)/iu.test(source.trim())
  )
    throw new TranslationQualityError(
      'The provider added commentary instead of just translating. Please retry.',
      'UNWANTED_COMMENTARY',
    );
  const missingTerms = normalizeProtectedTerms(protectedTerms).filter(
    (term) => source.includes(term) && !translation.includes(term),
  );
  // URLs must remain literal; unlike names or numeric words, they cannot be translated.
  const urls = source.match(/https?:\/\/[^\s<>]+/gu) ?? [];
  if (missingTerms.length || urls.some((url) => !translation.includes(url)))
    throw new TranslationQualityError(
      'The translation changed a protected term or link. Retry before replacing your text.',
      'FIDELITY_CHECK_FAILED',
    );
  return { translation, message: '' };
}
