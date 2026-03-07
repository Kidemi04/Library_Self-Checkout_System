export type GuardrailResult =
  | { kind: 'accept' }
  | { kind: 'clarify'; reply: string }
  | { kind: 'reject'; reply: string };

const CLARIFY_REPLY =
  'What kind of books are you interested in? Share genres, topics, mood, or course units.';
const GREETING_REPLY =
  'Hi! Tell me what you like to read and I will recommend books from the catalog.';
const MORE_REPLY =
  "Want more picks? Tell me the topic or genre to focus on and I'll suggest more from the catalog.";
const WHY_REPLY =
  "I recommend books based on the interests you share and what matches the catalog. Tell me what you'd like, and I can explain why each pick fits.";
const FEEDBACK_REPLY =
  "Thanks for the feedback. Tell me the exact topic or genre you want and I'll focus on that.";
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
  /\bcode\b/i,
  /\bcoding\b/i,
  /\bprogram(ming|mer|mers)?\b/i,
  /\bsoftware\b/i,
  /\bdeveloper(s)?\b/i,
  /\bpython\b/i,
  /\bscience\b/i,
  /\bcs\b/i,
  /\bdata\b/i,
  /\banalytics?\b/i,
  /\bstatistics?\b/i,
  /\bmath(s)?\b/i,
  /\bcalculus\b/i,
  /\bcalculation(s)?\b/i,
  /\balgorithm(s)?\b/i,
  /\bai\b/i,
  /\bartificial intelligence\b/i,
  /\bmachine learning\b/i,
  /\bml\b/i,
  /\bdata science\b/i,
  /\bengineering\b/i,
  /\bengineer(s)?\b/i,
  /\bdesign\b/i,
  /\bmultimedia\b/i,
  /\boperating system(s)?\b/i,
  /\bos\b/i,
  /\bart\b/i,
  /\bbusiness\b/i,
  /\bmanagement\b/i,
  /\bfinance\b/i,
  /\bfiance\b/i,
  /\baccounting\b/i,
  /\bmarketing\b/i,
  /\beconomics?\b/i,
];

const GREETING_PATTERNS = [/^\s*(hi|hello|hey|yo|hiya|halo|hai)\b/i];
const MORE_PATTERNS = [/^\s*(any\s*more|more|another|next|what\s*else|else)\b/i];
const WHY_PATTERNS = [/^\s*why\b/i];
const FEEDBACK_PATTERNS = [
  /\b(those|these)\s+(are|aren't|are not|isn't|is not)\b/i,
  /\bnot\s+(right|correct|relevant|marketing|art|design|engineering|finance|accounting|ai|python)\b/i,
  /\bwrong\b/i,
  /\birrelevant\b/i,
  /\bnot\s+what\s+i\s+wanted\b/i,
];
const NON_ENGLISH_PATTERNS = [
  /\bni\s*hao\b/i,
  /\bbonjour\b/i,
  /\bhola\b/i,
  /\bciao\b/i,
  /\bkonnichiwa\b/i,
  /\bsawadee\b/i,
];

const AMBIGUOUS_PATTERNS = [/^\s*(help|recommend|suggest)\b/i];

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

  const isExplicitNonEnglish = NON_ENGLISH_PATTERNS.some((pattern) => pattern.test(trimmed));
  if (isExplicitNonEnglish) {
    return {
      kind: 'reject',
      reply: 'Please use English only for recommendations.',
    };
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

  const isGreeting = GREETING_PATTERNS.some((pattern) => pattern.test(trimmed));
  if (isGreeting) {
    return { kind: 'clarify', reply: GREETING_REPLY };
  }

  const asksForMore = MORE_PATTERNS.some((pattern) => pattern.test(trimmed));
  if (asksForMore) {
    return { kind: 'clarify', reply: MORE_REPLY };
  }

  const asksWhy = WHY_PATTERNS.some((pattern) => pattern.test(trimmed));
  if (asksWhy) {
    return { kind: 'clarify', reply: WHY_REPLY };
  }

  const isFeedback = FEEDBACK_PATTERNS.some((pattern) => pattern.test(trimmed));
  if (isFeedback) {
    return { kind: 'clarify', reply: FEEDBACK_REPLY };
  }

  const isAmbiguous = AMBIGUOUS_PATTERNS.some((pattern) => pattern.test(trimmed));
  if (isAmbiguous || trimmed.split(/\s+/).length <= 3) {
    return { kind: 'clarify', reply: CLARIFY_REPLY };
  }

  return { kind: 'reject', reply: REJECT_REPLY };
}
