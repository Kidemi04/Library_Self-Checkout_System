export type GuardrailResult =
  | { kind: 'accept' }
  | { kind: 'clarify'; reply: string }
  | { kind: 'reject'; reply: string };

const CLARIFY_REPLY =
  'What kind of books are you interested in? Share genres, topics, mood, or course units.';
const REJECT_REPLY =
  'I can only help with book recommendations. Please share reading interests in English.';

const SIGNAL_PATTERNS = [
  /\bbook(s)?\b/i,
  /\bnovel(s)?\b/i,
  /\bread(ing)?\b/i,
  /\bauthor(s)?\b/i,
  /\bgenre(s)?\b/i,
  /\bseries\b/i,
  /\blibrary\b/i,
  /\bborrow(ing)?\b/i,
  /\bcatalog(ue)?\b/i,
  /\bfiction\b/i,
  /\bnonfiction\b/i,
  /\bfantasy\b/i,
  /\bromance\b/i,
  /\bmystery\b/i,
  /\bthriller\b/i,
  /\bscience\b/i,
  /\bhistory\b/i,
  /\bbiograph(y|ies)\b/i,
  /\bself-?help\b/i,
  /\bpoetry\b/i,
  /\bmanga\b/i,
  /\bcomic(s)?\b/i,
  /\bgraphic novel(s)?\b/i,
  /\byoung adult\b/i,
  /\bya\b/i,
  /\bkids\b/i,
  /\bchildren\b/i,
  /\bteen(s)?\b/i,
  /\brecommend(ation|ations|)\b/i,
  /\bsuggest(ion|ions|)\b/i,
  /\btopic(s)?\b/i,
  /\bmood\b/i,
  /\bcourse\b/i,
  /\bunit\b/i,
  /\bcomputer\b/i,
  /\bcomputing\b/i,
  /\bscience\b/i,
  /\bcs\b/i,
  /\bdata\b/i,
  /\bengineering\b/i,
  /\bbusiness\b/i,
  /\bmanagement\b/i,
];

const AMBIGUOUS_PATTERNS = [
  /^\s*(hi|hello|hey|yo)\b/i,
  /^\s*(help|recommend|suggest)\b/i,
];

const isEnglishInput = (value: string) => {
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code > 127) return false;
  }
  return true;
};

export function evaluateGuardrails(input: string): GuardrailResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { kind: 'clarify', reply: CLARIFY_REPLY };
  }

  if (!isEnglishInput(trimmed)) {
    return {
      kind: 'reject',
      reply: 'Please use English only for recommendations.',
    };
  }

  const hasSignal = SIGNAL_PATTERNS.some((pattern) => pattern.test(trimmed));
  if (hasSignal) {
    return { kind: 'accept' };
  }

  const isAmbiguous = AMBIGUOUS_PATTERNS.some((pattern) => pattern.test(trimmed));
  if (isAmbiguous || trimmed.split(/\s+/).length <= 3) {
    return { kind: 'clarify', reply: CLARIFY_REPLY };
  }

  return { kind: 'reject', reply: REJECT_REPLY };
}
