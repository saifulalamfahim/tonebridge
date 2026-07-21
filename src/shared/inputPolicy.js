export const MAX_SOURCE_TEXT_LENGTH = 8_000;

export class SourceTextError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'SourceTextError';
    this.code = code;
  }
}

export function assertValidSourceText(text) {
  if (typeof text !== 'string' || !text.trim())
    throw new SourceTextError('Enter some Bangla or Banglish text first.', 'EMPTY_SOURCE_TEXT');
  if (text.length > MAX_SOURCE_TEXT_LENGTH)
    throw new SourceTextError(
      `This editor contains more than ${MAX_SOURCE_TEXT_LENGTH.toLocaleString('en-US')} characters. Translate a shorter section.`,
      'SOURCE_TEXT_TOO_LONG',
    );
  return text;
}
