import { tokenizeInterests } from '@/app/lib/recommendations/recommender';

export type AiPreferenceResult = {
  summary: string;
  interests: string[];
  exclusions: string[];
  followUpQuestion: string;
};

export type BookSummary = {
  id: string;
  title: string;
  author: string | null;
  tags?: string[];
};

const DEFAULT_FOLLOW_UP = 'Any authors or series you already like?';

type Provider = 'gemini';

const getEnv = () => ({
  provider: (process.env.LLM_PROVIDER?.trim().toLowerCase() as Provider | undefined) ?? undefined,
  geminiBaseUrl:
    process.env.GEMINI_API_BASE_URL?.trim() ||
    'https://generativelanguage.googleapis.com/v1beta',
  geminiApiKey: process.env.GEMINI_API_KEY?.trim(),
  geminiModel: process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash',
});

const safeJsonParse = (content: string): AiPreferenceResult | null => {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed) as AiPreferenceResult;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as AiPreferenceResult;
    } catch {
      return null;
    }
  }
};

const FALLBACK_STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'into', 'about', 'that', 'this',
  'you', 'your', 'can', 'could', 'would', 'should', 'will', 'may', 'might',
  'want', 'like', 'need', 'get', 'got', 'give', 'take', 'make', 'see',
  'share', 'show', 'tell', 'help', 'ask', 'book', 'books', 'read', 'reading',
  'recommend', 'recommendation', 'suggest', 'some', 'more', 'please', 'thanks',
  'me', 'yo', 'hi', 'hey', 'something', 'anything', 'sure', 'okay',
  'have', 'has', 'had', 'are', 'was', 'were', 'been', 'being', 'not', 'dont',
  'do', 'did', 'does', 'got', 'gonna', 'wanna',
]);

const NEGATION_PATTERNS = [
  /\b(?:don'?t|do not|doesn'?t|does not|not)\s+(?:want|like|need|care for|interested in)\s+(?:books?\s+(?:about|on|related to)?\s*)?([\w\s]+)/gi,
  /\b(?:no|without|avoid|skip|exclude)\s+(?:books?\s+(?:about|on)?\s*)?([\w\s]+)/gi,
  /\b(?:hate|dislike)\s+(?:books?\s+(?:about|on)?\s*)?([\w\s]+)/gi,
  /\bnot interested in\s+([\w\s]+)/gi,
];

const extractExclusions = (message: string): string[] => {
  const excluded: string[] = [];
  for (const pattern of NEGATION_PATTERNS) {
    let match;
    while ((match = pattern.exec(message.toLowerCase())) !== null) {
      const captured = match[1]?.trim();
      if (captured) {
        captured.split(/\s+/)
          .map((t) => t.replace(/[^a-z0-9\-]/g, ''))
          .filter((t) => t.length >= 2 && !FALLBACK_STOPWORDS.has(t))
          .forEach((t) => excluded.push(t));
      }
    }
  }
  return Array.from(new Set(excluded));
};

const buildFallback = (message: string): AiPreferenceResult => {
  const exclusions = extractExclusions(message);
  const raw = message.trim();
  const shortTokens = raw
    .split(/[\s,]+/)
    .map((t) => t.toLowerCase().replace(/[^a-z0-9\-]/g, ''))
    .filter((t) => t.length >= 2 && !FALLBACK_STOPWORDS.has(t));
  const longTokens = tokenizeInterests(raw).filter((t) => !FALLBACK_STOPWORDS.has(t));
  const merged = Array.from(new Set([...shortTokens, ...longTokens]));
  const interests = merged.slice(0, 6);
  const summary = interests.length
    ? `You want to learn about ${interests.join(', ')}`
    : 'Interests captured from your message';
  return {
    summary,
    interests,
    exclusions,
    followUpQuestion: DEFAULT_FOLLOW_UP,
  };
};

const GEMINI_SYSTEM_PROMPT =
  'You are a library recommender. Extract reading preferences and return ONLY valid JSON with keys: summary (string), interests (array of 3-8 short tokens), exclusions (array of topics the user explicitly does NOT want, empty array if none), followUpQuestion (short book-specific question). Use English only. No extra text.';

const extractWithGemini = async (message: string) => {
  const { geminiBaseUrl, geminiApiKey, geminiModel } = getEnv();
  if (!geminiApiKey || !geminiModel) return null;

  const url = `${geminiBaseUrl.replace(/\/+$/, '')}/models/${encodeURIComponent(
    geminiModel,
  )}:generateContent?key=${encodeURIComponent(geminiApiKey)}`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: GEMINI_SYSTEM_PROMPT },
          { text: message },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorText = '';
    try {
      errorText = await response.text();
    } catch {
      errorText = '';
    }
    console.error('Gemini API error', response.status, errorText);
    return null;
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('') ?? '';

  if (!text.trim()) return null;
  const parsed = safeJsonParse(text);
  if (!parsed) {
    console.error('Gemini API returned non-JSON content');
  }
  return parsed;
};

const safeRecordParse = (content: string): Record<string, string> | null => {
  const trimmed = content.trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, string>;
    return null;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      const parsed = JSON.parse(match[0]);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, string>;
      return null;
    } catch { return null; }
  }
};

const REASONS_SYSTEM_PROMPT =
  'You are a library assistant. Given a user\'s learning goal and a list of books, write ONE sentence (max 20 words) per book explaining why that specific book helps the user reach their goal. Return ONLY valid JSON: {"<key>": "<reason>"}. No extra text.';

const generateReasonsWithGemini = async (
  interestSummary: string,
  books: BookSummary[],
): Promise<Record<string, string> | null> => {
  const { geminiBaseUrl, geminiApiKey, geminiModel } = getEnv();
  if (!geminiApiKey || !geminiModel || !books.length) return null;

  const keyMap: Record<string, string> = {};
  const bookList = books.map((b, i) => {
    const key = `b${i}`;
    keyMap[key] = b.id;
    const tags = (b.tags ?? []).slice(0, 5).join(', ');
    return `${key}: "${b.title}" by ${b.author ?? 'Unknown'}${tags ? ` [${tags}]` : ''}`;
  }).join('\n');

  const url = `${geminiBaseUrl.replace(/\/+$/, '')}/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(geminiApiKey)}`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: REASONS_SYSTEM_PROMPT }, { text: `User's goal: ${interestSummary}\n\nBooks:\n${bookList}` }] }],
    generationConfig: { temperature: 0.4 },
  };

  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!response.ok) return null;

  const data = (await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
  if (!text.trim()) return null;

  const parsed = safeRecordParse(text);
  if (!parsed) return null;

  const result: Record<string, string> = {};
  for (const [key, reason] of Object.entries(parsed)) {
    const bookId = keyMap[key];
    if (bookId && typeof reason === 'string' && reason.trim()) result[bookId] = reason.trim();
  }
  return Object.keys(result).length ? result : null;
};

export async function generateBookReasons(
  interestSummary: string,
  books: BookSummary[],
): Promise<Record<string, string>> {
  if (!books.length) return {};
  const { geminiApiKey } = getEnv();
  if (!geminiApiKey) return {};
  try {
    return (await generateReasonsWithGemini(interestSummary, books)) ?? {};
  } catch { return {}; }
}

export async function extractPreferences(message: string): Promise<AiPreferenceResult> {
  const { provider, geminiApiKey } = getEnv();

  if (provider === 'gemini' || geminiApiKey) {
    try {
      const geminiResult = await extractWithGemini(message);
      if (geminiResult) {
        const interests =
          Array.isArray(geminiResult.interests) && geminiResult.interests.length
            ? geminiResult.interests.map((value) => String(value).trim()).filter(Boolean)
            : buildFallback(message).interests;

        return {
          summary: geminiResult.summary?.toString().trim() || buildFallback(message).summary,
          interests,
          exclusions: Array.isArray(geminiResult.exclusions)
            ? geminiResult.exclusions.map((v) => String(v).trim()).filter(Boolean)
            : extractExclusions(message),
          followUpQuestion:
            geminiResult.followUpQuestion?.toString().trim() || DEFAULT_FOLLOW_UP,
        };
      }
    } catch {
      return buildFallback(message);
    }
  }

  return buildFallback(message);
}
