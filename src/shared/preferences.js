export const MAX_PROTECTED_TERMS = 50;
export const MAX_PROTECTED_TERM_LENGTH = 80;

function removeControlCharacters(value) {
  return Array.from(String(value), (character) => {
    const code = character.codePointAt(0);
    return code < 32 || code === 127 ? ' ' : character;
  }).join('');
}

export function normalizeProtectedTerms(value) {
  const entries = Array.isArray(value) ? value : String(value ?? '').split(/\r?\n/u);
  const terms = [];
  const seen = new Set();

  for (const entry of entries) {
    const term = removeControlCharacters(entry).trim();
    if (!term || term.length > MAX_PROTECTED_TERM_LENGTH) continue;
    const key = term.toLocaleLowerCase('en');
    if (seen.has(key)) continue;
    seen.add(key);
    terms.push(term);
    if (terms.length === MAX_PROTECTED_TERMS) break;
  }

  return terms;
}
