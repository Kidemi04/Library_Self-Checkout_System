import { tokenizeInterests } from '@/app/lib/recommendations/recommender';

export type AiPreferenceResult = {
  summary: string;
  interests: string[];
  followUpQuestion: string;
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

const buildFallback = (message: string): AiPreferenceResult => {
  const tokens = tokenizeInterests(message);
  const interests = tokens.slice(0, 6);
  const summary = interests.length
    ? `Interests: ${interests.join(', ')}`
    : 'Interests captured from your message';
  return {
    summary,
    interests,
    followUpQuestion: DEFAULT_FOLLOW_UP,
  };
};

const GEMINI_SYSTEM_PROMPT =
  'You are a library recommender. Extract reading preferences and return ONLY valid JSON with keys: summary (string), interests (array of 3-8 short tokens), followUpQuestion (short book-specific question). Use English only. No extra text.';

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
