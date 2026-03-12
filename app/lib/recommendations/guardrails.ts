export type GuardrailResult =
  | { kind: 'accept' }
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

  const lowered = trimmed.toLowerCase();
  const hasCourseSignal = COURSE_KEYWORDS.some((keyword) => lowered.includes(keyword));
  if (hasCourseSignal) {
    return { kind: 'accept' };
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
