// Guardrails — only handles sensitive content and non-English detection.
// Intent classification is now handled by the AI in ai.ts.

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
  /\bporn\b/i,
  /\bnude\b/i,
  /\bcredential(s)?\b/i,
  /\bpassword(s)?\b/i,
  /\bapi\s*key\b/i,
  /\bapi\s*token\b/i,
  /\baccess\s*token\b/i,
  /\bsecret\b/i,
  /\bcredit\s*card\b/i,
  /\bssn\b/i,
  /\bwhat\s+ai\s+model\b/i,
  /\bwhat\s+model\b/i,
  /\bwho\s+made\s+you\b/i,
  /\bwho\s+are\s+you\b/i,
];

const isEnglishInput = (value: string) => {
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code > 127) return false;
  }
  return true;
};

export const isSensitiveContent = (input: string): boolean => {
  const trimmed = input.trim();
  if (!isEnglishInput(trimmed)) return true;
  if (NON_ENGLISH_PATTERNS.some((p) => p.test(trimmed))) return true;
  if (SENSITIVE_PATTERNS.some((p) => p.test(trimmed))) return true;
  return false;
};

// Legacy export — kept so any existing imports don't break
export type GuardrailResult =
  | { kind: 'accept' }
  | { kind: 'clarify'; reply: string }
  | { kind: 'reject'; reply: string };

export const evaluateGuardrails = (input: string): GuardrailResult => {
  if (isSensitiveContent(input)) {
    return {
      kind: 'reject',
      reply: 'Sorry, I cannot help with that topic. Feel free to ask about books or academic subjects.',
    };
  }
  return { kind: 'accept' };
};

export const isChatIntent = (_input: string): boolean => false;
