export type GuardrailResult =
  | { kind: 'accept' }
  | { kind: 'greeting'; reply: string }
  | { kind: 'clarify'; reply: string }
  | { kind: 'reject'; reply: string };

const CLARIFY_REPLY =
  'What course area are you interested in? Share a Swinburne Sarawak course or field (e.g., data science, software engineering, cyber security, accounting, finance, design, biotechnology, environmental science, computer science, ICT).';
const REJECT_REPLY =
  'I can only help with book recommendations tied to Swinburne Sarawak course areas. Please share a course or field in English.';

const COURSE_KEYWORDS = [
  'engineering',
  'chemical',
  'civil',
  'electrical',
  'electronic',
  'mechanical',
  'robotics',
  'mechatronics',
  'software',
  'software engineering',
  'programming',
  'coding',
  'computer science',
  'computing',
  'information technology',
  'information and communication technology',
  'ict',
  'quantity surveying',
  'biotechnology',
  'environmental science',
  'cyber security',
  'cybersecurity',
  'ai',
  'artificial intelligence',
  'data science',
  'data',
  'design',
  'multimedia design',
  'business',
  'accounting',
  'finance',
];

const SIGNAL_PATTERNS = [
  /\bbook(s)?\b/i,
  /\bread(ing)?\b/i,
  /\brecommend(ation|ations|)\b/i,
  /\bsuggest(ion|ions|)\b/i,
  /\bcourse\b/i,
  /\bunit\b/i,
  /\bassignment\b/i,
  /\bsyllabus\b/i,
  /\bcurriculum\b/i,
  /\bstudy\b/i,
];

const AMBIGUOUS_PATTERNS = [
  /^\s*(hi|hello|hey|yo)\b/i,
  /^\s*(help|recommend|suggest)\b/i,
];

const GREETING_PATTERNS = [
  /^\s*(hi|hello|hey|yo)\b/i,
  /\bgood\s*(morning|afternoon|evening)\b/i,
  /\bhowdy\b/i,
];

const buildGreetingReply = () =>
  'Hi! How can I help you with book recommendations for your course?';

const isEnglishInput = (value: string) => {
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code > 127) return false;
  }
  return true;
};

const levenshtein = (a: string, b: string): number => {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (__, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
};

// Individual words from COURSE_KEYWORDS + root forms (strip -ing) so
// "enggiener" can fuzzy-match "engineer" alongside "engineering"
const KEYWORD_TOKENS = Array.from(
  new Set(
    COURSE_KEYWORDS.flatMap((kw) => {
      const words = kw.split(/\s+/).filter((t) => t.length > 3);
      const roots = words.flatMap((w) => {
        const forms: string[] = [];
        if (w.endsWith('ing') && w.length > 6) forms.push(w.slice(0, -3));
        if (w.endsWith('tion') && w.length > 7) forms.push(w.slice(0, -4));
        return forms;
      });
      return [...words, ...roots];
    }),
  ),
);

const hasFuzzyMatch = (inputTokens: string[]): boolean => {
  for (const token of inputTokens) {
    if (token.length < 4) continue;
    for (const kwToken of KEYWORD_TOKENS) {
      // First letter must match — prevents false positives
      if (token[0] !== kwToken[0]) continue;
      // Allow more edits for longer words: ceil(max_length / 4)
      const maxDist = Math.ceil(Math.max(token.length, kwToken.length) / 4);
      if (levenshtein(token, kwToken) <= maxDist) return true;
    }
  }
  return false;
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

  const lowered = trimmed.toLowerCase();

  // Check course keywords FIRST — "yo, got something for data science?" must
  // be accepted even though it starts with a greeting word
  const hasCourseSignal = COURSE_KEYWORDS.some((keyword) => lowered.includes(keyword));
  if (hasCourseSignal) {
    return { kind: 'accept' };
  }

  // Fuzzy match — catches typos like "artifical", "enggiener", "cybersecuity"
  const inputTokens = lowered.split(/\s+/).filter((t) => t.length > 3);
  if (hasFuzzyMatch(inputTokens)) {
    return { kind: 'accept' };
  }

  // Only treat as greeting if no course signal was found
  if (GREETING_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return { kind: 'greeting', reply: buildGreetingReply() };
  }

  const hasSignal = SIGNAL_PATTERNS.some((pattern) => pattern.test(trimmed));
  if (hasSignal) {
    return { kind: 'clarify', reply: CLARIFY_REPLY };
  }

  const isAmbiguous = AMBIGUOUS_PATTERNS.some((pattern) => pattern.test(trimmed));
  if (isAmbiguous || trimmed.split(/\s+/).length <= 3) {
    return { kind: 'clarify', reply: CLARIFY_REPLY };
  }

  return { kind: 'reject', reply: REJECT_REPLY };
}
