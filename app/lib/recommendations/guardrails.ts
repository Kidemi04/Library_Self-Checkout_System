export type GuardrailResult =
  | { kind: 'accept' }
  | { kind: 'clarify'; reply: string }
  | { kind: 'reject'; reply: string };

const CLARIFY_REPLY =
  'What kind of books are you interested in? Share genres, topics, or course units. For study help, ask a programming or language question.';
const GREETING_REPLY =
  'Hi! Tell me what you like to read and I will recommend books from the catalog.';
const SMALLTALK_REPLY =
  "I'm here to help with book recommendations or study questions. Tell me a topic to get started.";
const MORE_REPLY =
  "Want more picks? Tell me the topic or genre to focus on and I'll suggest more from the catalog.";
const WHY_REPLY =
  "I recommend books based on the interests you share and what matches the catalog. Tell me what you'd like, and I can explain why each pick fits.";
const FEEDBACK_REPLY =
  "Thanks for the feedback. Tell me the exact topic or genre you want and I'll focus on that.";
const CATALOG_REPLY =
  'I can recommend from the library catalog. Tell me a topic, genre, or course unit you want.';
const REJECT_REPLY =
  'I can only help with book recommendations or study topics like programming and language learning.';
const SENSITIVE_REPLY =
  'Sorry, I cannot help with that topic. Please ask about books or study topics like programming or language learning.';

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
  /\bcourse\b/i,
  /\bunit\b/i,
  /\bcomputer\b/i,
  /\bcomputing\b/i,
  /\bcode\b/i,
  /\bcoding\b/i,
  /\bprogram(ming|mer|mers)?\b/i,
  /\bprograming\b/i,
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
  /\bartificial intelligent\b/i,
  /\bmachine learning\b/i,
  /\bml\b/i,
  /\bdata science\b/i,
  /\bengineering\b/i,
  /\bengineer(s)?\b/i,
  /\bdesign\b/i,
  /\bmultimedia\b/i,
  /\brobotic(s)?\b/i,
  /\brobot\b/i,
  /\boperating system(s)?\b/i,
  /\bos\b/i,
  /\bart\b/i,
  /\bstatistics?\b/i,
  /\bstats\b/i,
  /\bbusiness\b/i,
  /\bmanagement\b/i,
  /\bfinance\b/i,
  /\bfiance\b/i,
  /\baccounting\b/i,
  /\bmarketing\b/i,
  /\beconomics?\b/i,
];

const GREETING_PATTERNS = [
  /^\s*(hi|hello|hey|yo|hiya|halo|hai)\b/i,
  /^\s*(good\s+morning|morning|good\s+afternoon|good\s+evening|good\s+night)\b/i,
];
const SMALLTALK_PATTERNS = [
  /^\s*(how\s+are\s+you|are\s+you\s+good|are\s+you\s+ok|are\s+you\s+okay)\b/i,
  /^\s*(what\s+is\s+up|what's\s+up)\b/i,
];
const MORE_PATTERNS = [/^\s*(any\s*more|more|another|next|what\s*else|else)\b/i];
const WHY_PATTERNS = [/^\s*why\b/i];
const FEEDBACK_PATTERNS = [
  /\b(those|these)\s+(are|aren't|are not|isn't|is not)\b/i,
  /\bnot\s+(right|correct|relevant|marketing|art|design|engineering|finance|accounting|ai|python)\b/i,
  /\bwrong\b/i,
  /\birrelevant\b/i,
  /\bnot\s+what\s+i\s+wanted\b/i,
];
const CATALOG_PATTERNS = [
  /\bwhat\s+kind\s+of\s+books?\b/i,
  /\bwhat\s+books?\s+do\s+you\s+have\b/i,
  /\bwhat\s+book\s+do\s+you\s+have\b/i,
  /\bwhat\s+kind\s+of\s+book\b/i,
  /\bdo\s+you\s+have\s+any\s+books?\b/i,
  /\bno\s+books?\b/i,
  /\bno\s+book\b/i,
  /\bbook\s+related\s+to\b/i,
  /\bbooks?\s+about\b/i,
];
const NON_ENGLISH_PATTERNS = [
  /\bni\s*hao\b/i,
  /\bbonjour\b/i,
  /\bhola\b/i,
  /\bciao\b/i,
  /\bkonnichiwa\b/i,
  /\bsawadee\b/i,
];

const SENSITIVE_PATTERNS = [
  /\bpolitic(s|al)?\b/i,
  /\belection(s)?\b/i,
  /\bvote\b/i,
  /\bgovernment\b/i,
  /\bpresident\b/i,
  /\bparliament\b/i,
  /\breligion(s)?\b/i,
  /\bfaith\b/i,
  /\bgod\b/i,
  /\bchurch\b/i,
  /\bmosque\b/i,
  /\btemple\b/i,
  /\bsex\b/i,
  /\bsexual\b/i,
  /\bnsfw\b/i,
  /\badult\b/i,
  /\bporn\b/i,
  /\bnude\b/i,
  /\bcredential(s)?\b/i,
  /\bpassword(s)?\b/i,
  /\bapi\s*key\b/i,
  /\bapi\s*token\b/i,
  /\baccess\s*token\b/i,
  /\bsecret\b/i,
  /\blogin\b/i,
  /\bcredit\s*card\b/i,
  /\bssn\b/i,
  /\bwhat\s+ai\s+model\b/i,
  /\bwhat\s+model\b/i,
  /\bwho\s+made\s+you\b/i,
  /\bwho\s+are\s+you\b/i,
];

const CHAT_TOPIC_PATTERNS = [
  /\blanguage\b/i,
  /\benglish\b/i,
  /\bgrammar\b/i,
  /\bvocabulary\b/i,
  /\bwriting\b/i,
  /\bcode\b/i,
  /\bcoding\b/i,
  /\bprogram(ming|mer|mers)?\b/i,
  /\bsoftware\b/i,
  /\bdeveloper(s)?\b/i,
  /\bpython\b/i,
  /\bjava(script)?\b/i,
  /c\+\+/i,
  /\bc#\b/i,
  /\bjavascript\b/i,
  /\btypescript\b/i,
  /\bhtml\b/i,
  /\bcss\b/i,
  /\bai\b/i,
  /\bartificial intelligence\b/i,
  /\bmachine learning\b/i,
  /\bdata\b/i,
  /\bdata science\b/i,
  /\bstatistics?\b/i,
  /\bmath(s)?\b/i,
  /\balgorithm(s)?\b/i,
  /\boperating system(s)?\b/i,
  /\bos\b/i,
];

const QUESTION_PATTERNS = [
  /\?$/,
  /^\s*(what|why|how|who|where|when|explain|define|tell me about|help me with)\b/i,
  /\bwant to know about\b/i,
  /\bcan you (explain|tell me about|help)\b/i,
  /\bi\s*(am|m|'m)\s+asking\s+about\b/i,
  /\bi\s+want\s+to\s+ask\s+about\b/i,
  /\bi\s*(want|need)\s+to\s+learn\s+about\b/i,
];

const AMBIGUOUS_PATTERNS = [/^\s*(help|recommend|suggest)\b/i];

const isEnglishInput = (value: string) => {
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code > 127) return false;
  }
  return true;
};

const normalizeInput = (value: string) =>
  value
    .toLowerCase()
    .replace(/\bprograming\b/g, 'programming')
    .replace(/\bboook\b/g, 'book')
    .replace(/\bstastic\b/g, 'statistics')
    .replace(/\bstatistic\b/g, 'statistics')
    .replace(/\bintelligenct\b/g, 'intelligence')
    .replace(/\bartificial intelligent\b/g, 'artificial intelligence')
    .replace(/\brobotuc\b/g, 'robotic')
    .replace(/\bai\b/g, 'ai');

export function evaluateGuardrails(input: string): GuardrailResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { kind: 'clarify', reply: CLARIFY_REPLY };
  }
  const normalized = normalizeInput(trimmed);

  const isExplicitNonEnglish = NON_ENGLISH_PATTERNS.some((pattern) => pattern.test(normalized));
  if (isExplicitNonEnglish) {
    return {
      kind: 'reject',
      reply: 'Please use English only for recommendations.',
    };
  }

  if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return {
      kind: 'reject',
      reply: SENSITIVE_REPLY,
    };
  }

  if (!isEnglishInput(trimmed)) {
    return {
      kind: 'reject',
      reply: 'Please use English only for recommendations.',
    };
  }

  const hasSignal = SIGNAL_PATTERNS.some((pattern) => pattern.test(normalized));
  if (hasSignal) {
    return { kind: 'accept' };
  }

  const isGreeting = GREETING_PATTERNS.some((pattern) => pattern.test(normalized));
  if (isGreeting) {
    return { kind: 'clarify', reply: GREETING_REPLY };
  }

  const isSmalltalk = SMALLTALK_PATTERNS.some((pattern) => pattern.test(normalized));
  if (isSmalltalk) {
    return { kind: 'clarify', reply: SMALLTALK_REPLY };
  }

  if (/^[\W_]+$/.test(trimmed)) {
    return { kind: 'clarify', reply: CLARIFY_REPLY };
  }

  const asksForMore = MORE_PATTERNS.some((pattern) => pattern.test(normalized));
  if (asksForMore) {
    return { kind: 'clarify', reply: MORE_REPLY };
  }

  const asksWhy = WHY_PATTERNS.some((pattern) => pattern.test(normalized));
  if (asksWhy) {
    return { kind: 'clarify', reply: WHY_REPLY };
  }

  const isFeedback = FEEDBACK_PATTERNS.some((pattern) => pattern.test(normalized));
  if (isFeedback) {
    return { kind: 'clarify', reply: FEEDBACK_REPLY };
  }

  const isCatalogQuestion = CATALOG_PATTERNS.some((pattern) => pattern.test(normalized));
  if (isCatalogQuestion) {
    return { kind: 'clarify', reply: CATALOG_REPLY };
  }

  const isAmbiguous = AMBIGUOUS_PATTERNS.some((pattern) => pattern.test(normalized));
  if (isAmbiguous || trimmed.split(/\s+/).length <= 3) {
    return { kind: 'clarify', reply: CLARIFY_REPLY };
  }

  return { kind: 'reject', reply: REJECT_REPLY };
}

export const isSensitiveContent = (input: string) =>
  SENSITIVE_PATTERNS.some((pattern) => pattern.test(input.trim()));

export const isChatIntent = (input: string) => {
  const trimmed = input.trim();
  if (!trimmed) return false;
  const normalized = normalizeInput(trimmed);
  if (/\bbook(s)?\b/i.test(normalized) || /\bcatalog\b/i.test(normalized)) return false;
  if (NON_ENGLISH_PATTERNS.some((pattern) => pattern.test(normalized))) return false;
  if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(normalized))) return false;
  if (!isEnglishInput(trimmed)) return false;
  const hasTopic = CHAT_TOPIC_PATTERNS.some((pattern) => pattern.test(normalized));
  const isQuestion = QUESTION_PATTERNS.some((pattern) => pattern.test(normalized));
  return hasTopic && isQuestion;
};
